module.exports = {
	"type": "likert",

	"scales": ["Extraversion","Agreeableness","Conscientiousness","Neuroticism", "Openness"],

	"prompt": "Now I'm going to ask you about several statements, just tell me how much you agree with them on scale of 1 to 5. I see myself as someone who...",


	"questions": [
		{"id":1,"q": "Is talkative", "measure":"Extraversion", "reverse":false},
		{"id":2,"q": "Tends to find fault with others", "measure":"Agreeableness", "reverse":true},
		{"id":3,"q": "Does a thorough job", "measure":"Conscientiousness", "reverse":false},
		{"id":4,"q": "Is depressed, blue", "measure":"Neuroticism", "reverse":false},
		{"id":5,"q": "Is original, comes up with new ideas", "measure":"Openness", "reverse":false},
		{"id":6,"q": "Is reserved", "measure":"Extraversion", "reverse":true},
		{"id":7,"q": "Is helpful and unselfish with others", "measure":"Agreeableness", "reverse":false},
		{"id":8,"q": "Can be somewhat careless", "measure":"Conscientiousness", "reverse":true},
		{"id":9,"q": "Is relaxed, handles stress well", "measure":"Neuroticism", "reverse":true},
		{"id":10,"q": "Is curious about many different things", "measure":"Openness", "reverse":false},
		{"id":11,"q": "Is full of energy", "measure":"Extraversion", "reverse":false},
		{"id":12,"q": "Starts quarrels with others", "measure":"Agreeableness", "reverse":true},
		{"id":13,"q": "Is a reliable worker", "measure":"Conscientiousness", "reverse":false},
		{"id":14,"q": "Can be tense", "measure":"Neuroticism", "reverse":false},
		{"id":15,"q": "Is ingenious, a deep thinker", "measure":"Openness", "reverse":false},
		{"id":16,"q": "Generates a lot of enthusiasm", "measure":"Extraversion", "reverse":false},
		{"id":17,"q": "Has a forgiving nature", "measure":"Agreeableness", "reverse":false},
		{"id":18,"q": "Tends to be disorganized", "measure":"Conscientiousness", "reverse":true},
		{"id":19,"q": "Worries a lot", "measure":"Neuroticism", "reverse":false},
		{"id":20,"q": "Has an active imagination", "measure":"Openness", "reverse":false},
		{"id":21,"q": "Tends to be quiet", "measure":"Extraversion", "reverse":true},
		{"id":22,"q": "Is generally trusting", "measure":"Agreeableness", "reverse":false},
		{"id":23,"q": "Tends to be lazy", "measure":"Conscientiousness", "reverse":true},
		{"id":24,"q": "Is emotionally stable, not easily upset", "measure":"Neuroticism", "reverse":true},
		{"id":25,"q": "Is inventive", "measure":"Openness", "reverse":false},
		{"id":26,"q": "Has an assertive personality", "measure":"Extraversion", "reverse":false},
		{"id":27,"q": "Can be cold and aloof", "measure":"Agreeableness", "reverse":true},
		{"id":28,"q": "Perseveres until the task is finished", "measure":"Conscientiousness", "reverse":false},
		{"id":29,"q": "Can be moody", "measure":"Neuroticism", "reverse":false},
		{"id":30,"q": "Values artistic, aesthetic experiences", "measure":"Openness", "reverse":false},
		{"id":31,"q": "Is sometimes shy, inhibited", "measure":"Extraversion", "reverse":true},
		{"id":32,"q": "Is considerate and kind to almost everyone", "measure":"Agreeableness", "reverse":false},
		{"id":33,"q": "Does things efficiently", "measure":"Conscientiousness", "reverse":false},
		{"id":34,"q": "Remains calm in tense situations", "measure":"Neuroticism", "reverse":true},
		{"id":35,"q": "Prefers work that is routine", "measure":"Openness", "reverse":true},
		{"id":36,"q": "Is outgoing, sociable", "measure":"Extraversion", "reverse":false},
		{"id":37,"q": "Is sometimes rude to others", "measure":"Agreeableness", "reverse":true},
		{"id":38,"q": "Makes plans and follows through with them", "measure":"Conscientiousness", "reverse":false},
		{"id":39,"q": "Gets nervous easily", "measure":"Neuroticism", "reverse":false},
		{"id":40,"q": "Likes to reflect, play with ideas", "measure":"Openness", "reverse":false},
		{"id":41,"q": "Has few artistic interests", "measure":"Openness", "reverse":true},
		{"id":42,"q": "Likes to cooperate with others", "measure":"Agreeableness", "reverse":false},
		{"id":43,"q": "Is easily distracted", "measure":"Conscientiousness", "reverse":true},
		{"id":44,"q": "Is sophisticated in art, music, or literature", "measure":"Openness", "reverse":false}
	],



	"scale": [{"option":"strongly disagree", "score":1},
			  {"option":"disagree a little", "score":2},
			  {"option":"neither agree nor disagree", "score":3},
			  {"option":"agree a little", "score":4},
			  {"option":"strongly agree", "score":5}
	],

}