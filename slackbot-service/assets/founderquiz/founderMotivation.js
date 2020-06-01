module.exports = {

    "type": "likert",

    "scales": ["motivation_money","motivation_challenge","motivation_advancement","motivation_society"],

    "prompt": "Now I'm going to ask you about four statements about what motivates you as an entrepreneur, just tell me how true they are about you on a scale of 1 to 5. My interest in founding a startup is...",

    "questions": [
        {"id":1,"q": "for the financial success.", "measure":"motivation_money", "reverse":false},
        {"id":2,"q": "the personal challenge.",  "measure":"motivation_challenge", "reverse":false},
        {"id":3,"q": "for the career advancement.", "measure":"motivation_advancement", "reverse":false},
        {"id":4,"q": "for making an important contribution to society.", "measure":"motivation_society", "reverse":false}
    ],


    "scale": [{"option":"strongly disagree", "score":1},
              {"option":"disagree", "score":2},
              {"option":"neither agree nor disagree", "score":3},
              {"option":"agree", "score":4},
              {"option":"strongly agree", "score":5}
    ]
}