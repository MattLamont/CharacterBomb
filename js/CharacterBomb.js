
var MAX_GAMES = 6;
var MAX_CHARACTERS = 4;

var games_array =[];

var api_key = `471719cbd9b73d75ddf99b9576f2c50d5c4508b4`;

class Game {
	constructor( name , detail_url ){
		this.name = name;
		this.url = detail_url;
		this.characters = [];
	}

	addCharacter( character ){
		this.characters.push( character );
	}
}


var app = angular.module( 'CharacterBomb' , [] );


app.controller( 'characterCtrl' , function( $scope , getContent ) {
	
	$scope.games = [];

	$scope.games = getContent.getGames( "mass effect" , $scope.games , 5 , function( games ){
		$scope.games = games;
	});

	
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

				//For each character in the returned JSON, add the character to the Game's character array
				for( i = 0 ; i < MAX_CHARACTERS ; i++ ){
					self.getCharacter( game , data.results.characters[i].api_detail_url , function(){

					});
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




