module.exports = {
	
	"type": "likert",

	"scales": ["Marketing","Innovation","Management","Risktaking","Financialcontrol",],

	"prompt": "Please indicate on a scale of 1(I don’t know how to do this) to 5(I’m awesome) how certain you are in your ability to perform each of these tasks.",



	"questions": [
		{"id":1,"q": "Set and meet market share goals.", "measure":"Marketing", "reverse":false},
		{"id":2,"q": "Set and meet sales goals.", "measure":"Marketing", "reverse":false},
		{"id":3,"q": "Set and attain profit goals.", "measure":"Marketing", "reverse":false},
		{"id":4,"q": "Establish position in product market.", "measure":"Marketing", "reverse":false},
		{"id":5,"q": "Conduct market analysis.", "measure":"Marketing", "reverse":false},
		{"id":6,"q": "Expand business.", "measure":"Marketing", "reverse":false},
		{"id":7,"q": "New venturing and new ideas.", "measure":"Innovation", "reverse":false},
		{"id":8,"q": "New products and services.", "measure":"Innovation", "reverse":false},
		{"id":9,"q": "New markets and geographic territories.", "measure":"Innovation", "reverse":false},
		{"id":10,"q": "New methods of production, marketing and management.", "measure":"Innovation", "reverse":false},
		{"id":11,"q": "Reduce risk and uncertainty.", "measure":"Management", "reverse":false},
		{"id":12,"q": "Strategic planning and develop information system.", "measure":"Management", "reverse":false},
		{"id":13,"q": "Manage time by setting goals.", "measure":"Management", "reverse":false},
		{"id":14,"q": "Establish and achieve goals and objectives.", "measure":"Management", "reverse":false},
		{"id":15,"q": "Define organizational roles, responsibilities, and policies.", "measure":"Management", "reverse":false},
		{"id":16,"q": "Take calculated risks.", "measure":"Risktaking", "reverse":false},
		{"id":17,"q": "Make decisions under uncertainty and risk.", "measure":"Risktaking", "reverse":false},
		{"id":18,"q": "Take responsibility for ideas and decisions.", "measure":"Risktaking", "reverse":false},
		{"id":19,"q": "Work under pressure and conflict.", "measure":"Risktaking", "reverse":false},
		{"id":20,"q": "Perform financial analysis.", "measure":"Financialcontrol", "reverse":false},
		{"id":21,"q": "Develop financial system and internal controls.", "measure":"Financialcontrol", "reverse":false},
		{"id":22,"q": "Control cost.", "measure":"Financialcontrol", "reverse":false}
		],



	"scale": [{"option":"completely unsure", "score":1},
			  {"option":"unsure", "score":2},
			  {"option":"neither unsure nor sure", "score":3},
			  {"option":"sure", "score":4},
			  {"option":"completely sure", "score":5}
	],

}

