// Client ID and API key from the Developer Console
var CLIENT_ID = '674138880049-gpoluv71edi3b5mutcat96rrg38tcrem.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCBa591SHRqKbeK1VqLN1rzpn_qc2zU8ec';

var placements = [];

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
	apiKey: API_KEY,
	clientId: CLIENT_ID,
	discoveryDocs: DISCOVERY_DOCS,
	scope: SCOPES
  }).then(function () {
	// Listen for sign-in state changes.
	listMajors();
  }, function(error) {
		console.log(JSON.stringify(error, null, 2));
  });
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors() {
  gapi.client.sheets.spreadsheets.values.get({
	spreadsheetId: '1lwo34dI5758vP0LB8eO3enGQBv6nM0xgPm6vzZeNgnQ',
	range: 'A2:J',
  }).then(function(response) {
	var range = response.result;
	if (range.values.length > 0) {
		
	  	for (i = 0; i < range.values.length; i++) {
			var row = range.values[i];
			var placeObject = {
				'Town': row[0],
				'Name': row[1],
				'Website': row[2],
				'Instagram': row[3],
				'Address': row[4],
				'Long': row[5],
				'Lat': row[6],
				'Code': row[7],
				'Image': row[8],
				'Copy': row[9]
			}
			placements.push(placeObject);
		}
		launchMapPlacements(placements);

	} else {
		console.log('No data found.');
	}
  }, function(response) {
	   console.log('Error: ' + response.result.error.message);
  });
}