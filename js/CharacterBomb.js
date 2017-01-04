
var MAX_GAMES = 6;
var MAX_CHARACTERS = 3;

var games_array =[];

var api_key = `471719cbd9b73d75ddf99b9576f2c50d5c4508b4`;

class Game {
	constructor( name , detail_url ){
		this.name = name;
		this.url = detail_url;
		this.characters = [];
		this.shown_characters = 0;
		this.total_characters = 0;
		this.getMore = true;
	}

	addCharacter( character ){

		if( character.gender == 0 ){
			character.gender = 'Other';
		}
		else if( character.gender == 1 ){
			character.gender = 'Male';
		}
		else if( character.gender == 2 ){
			character.gender = 'Female';
		}
		else{
			character.gender = 'Unknown';
		}
		
		this.characters.push( character );
		this.shown_characters = this.characters.length;

		if( this.shown_characters >= this.total_characters ){
			this.getMore = false;
		}
	}
}


var app = angular.module( 'CharacterBomb' , ['ui.bootstrap'] );


app.controller( 'characterCtrl' , function( $scope , getContent , $uibModal ) {
	
	$scope.games = [];
	$scope.search_value = "";

	$scope.games = getContent.getGames( "metroid" , $scope.games , 5 , function( games ){
		$scope.games = games;
	});


	$scope.search = function(){
		$scope.games = [];
		$scope.games = getContent.getGames( $scope.search_value , $scope.games , 5 , function( games ){
			$scope.games = games;
		});
	};

	$scope.getMoreCharacters = function( game_name ){

		if( game_name == "" ){
			return;
		}

		var game = null;

		jQuery.each( $scope.games , function( index , value ){
			if( value.name == game_name ){
				game = value;
				console.log( "index name = " + game.name );
			}
		} );

		if( game == null ){
			return;
		}

		for( i = 0 ; i < MAX_CHARACTERS ; i++ ){
			getContent.getSingleGame( game , function(){} );
		}
	};

	var $ctrl = this;
	$scope.openModal = function( character ){

		$ctrl.character = character;

		var modalInstance = $uibModal.open({
	      animation: true,
	      ariaLabelledBy: '$modal-title',
	      ariaDescribedBy: 'modal-body',
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      controllerAs: '$ctrl',
	      size: 'lg',
	      
	      resolve: {
	        character: function(){
	        	return $ctrl.character;
	        }
	      }
	});
	};
	
});

angular.module('CharacterBomb').controller('ModalInstanceCtrl', function ($uibModalInstance , character) {

  	var $ctrl = this;
  	$ctrl.character = character;


	$ctrl.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});

app.service( 'getContent' , function( $http ){

	//Need a new var equal to this object, so that we can call this services functions in other
	//service functions
	var self = this;

	/* Function:    getCharacters
	 * Description: Fills the provided game object with characters from that specific game.
	 *
	 * Game       : A game object that needs more characters to be added
	 * Callback   : A function to be called when the characters have been added to the game
	 */
	self.getCharacter = function( game , char_url , callback ){

		//The resource URL to get characters from 
		var character_url =	`${char_url}
							?api_key=${api_key}
							&format=jsonp
							&json_callback=JSON_CALLBACK`;

		//Perform a JSONP request to get around CORS restriction
		$http.jsonp( character_url )
			.success( function( data ){
			
				game.addCharacter( data.results );
				callback();
				
			});
	}

	self.getSingleGame = function( game , callback ){

		var game_url = 		`${game.url}
							?api_key=${api_key}
							&field_list=name,characters
							&format=jsonp
							&json_callback=JSON_CALLBACK`;

		//Perform a JSONP request to get around CORS restriction
		$http.jsonp( game_url )
			.success( function( data ){

				
				game.total_characters = data.results.characters.length;

				var index = game.shown_characters;

				//For each character in the returned JSON, add the character to the Game's character array
				for( i = 0 ; i < MAX_CHARACTERS ; i++ ){

					if( game.shown_characters >= data.results.characters.length ){
						break;
					}

					self.getCharacter( game , data.results.characters[index].api_detail_url , function(){

					});

					game.shown_characters++;
					index++;
				}
				
				//return back to the caller when all done
				callback();
			});
	}

	self.getGames = function( query_string , games , how_many , callback ){

		var games_url =	`http://www.giantbomb.com/api/search/
						?api_key=${api_key}
						&format=jsonp
						&query=${query_string}
						&resources=game
						&limit=${how_many}
						&field_list=name,api_detail_url
						&json_callback=JSON_CALLBACK`;

		$http.jsonp( games_url )
			.success( function( data ){
				
				jQuery.each( data.results , function( index , value ){

					var new_game = new Game( value.name , value.api_detail_url );
					self.getSingleGame( new_game , function(){
						games.push( new_game );
					} );
					
				});

				callback( games );

			});
	}

});




