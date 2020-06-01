from flask import Flask , request, jsonify
from nltk.stem import PorterStemmer;
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
import json, os
from operator import itemgetter
from dotenv import load_dotenv

app = Flask(__name__)

ps = PorterStemmer()

@app.route('/ping', methods = ['GET'])
def ping():
    return jsonify({ "reply" : "pong" })




@app.route('/targetCustomer', methods = ['GET'])
def target_customer():
    idea = (request.args.get('idea'))
    try:
        res = target_customer_predictor(idea)
        return jsonify(res)
    except:
        return jsonify({"success" : "false", "message" : "Some error occurred"})


@app.route('/ideaType', methods = ['GET'])
def type_predictor():
    idea = (request.args.get('idea'))
    try:
        res = type_predictor(idea)
        return jsonify(res)
    except:
        return jsonify({"success" : "false", "message" : "Some error occurred"})


@app.route('/offering-type', methods = ['GET'])
def offering_type_predictor():
    # product or service
    idea = (request.args.get('idea'))
    try:
        res = offering_predictor(idea)
        return jsonify(res)
    except:
        return jsonify({"success" : "false", "message" : "Some error occurred"})


@app.route('/categories', methods = ['GET'])
def categories():
    idea = (request.args.get('idea'))
    try:
        res = predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})


@app.route('/freshness', methods = ['GET'])
def freshness():
    idea = (request.args.get('idea'))
    try:
        res = freshness_predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})






@app.route('/startup-skills', methods = ['GET'])
def skills():
    idea = (request.args.get('idea'))
    try:
        res = skills_predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})





@app.route('/fundability', methods = ['GET'])
def fundability():
    idea = (request.args.get('idea'))
    try:
        res = fundability_predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})






@app.route('/size', methods = ['GET'])
def size():
    idea = (request.args.get('idea'))
    try:
        res = size_predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})





@app.route('/user-categories', methods = ['GET'])
def usercategories():
    idea = (request.args.get('idea'))
    try:
        res = usercategories_predictor(idea)
        return jsonify(res)

    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})






@app.route('/new-categories', methods = ['GET'])
def new_categories():
    idea = (request.args.get('idea'))
    try:
        res = new_categories_predictor(idea)
        return jsonify(res)
    except Exception as e:
        print(e)
        return jsonify({"success" : "false", "message" : "Some error occurred"})




def offering_predictor(idea):
    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []

    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/offering', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/offering', 'categories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./assets/offering/categories.json not found")
        return {"error": "unable to load categories.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }





def type_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []

    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/ideaType', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/ideaType', 'categories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./assets/ideaType/categories.json not found")
        return {"error": "unable to load categories.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }




# main function that identifies the idea type
def predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/idea-categories', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/idea-categories', 'categories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("topics.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }








def freshness_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []

    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/freshness', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/freshness', 'freshness.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./assets/freshness/freshness.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }




def skills_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))

    print("test",I)
    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/startupskills', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("./assets/startupskills/terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    # print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    # print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/startupskills', 'skills.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./asssets/startupskills/skills.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    # print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        # print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        # print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        # print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }







def fundability_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))

    print("test",I)
    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/fundability', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("./assets/fundability/terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    # print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    # print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/fundability', 'fundability.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./asssets/fundability/fundability.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    # print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        # print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        # print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        # print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }







def size_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))

    print("test",I)
    # loop through terms.json and load it into Term vector
    try:
        term_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/startupsize', 'terms.json')
        with open(term_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("assets/startupsize/terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    # print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    # print("filled v ", V)
    # Load topics json
    try:
        topic_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/startupsize', 'startupsize.json')
        with open(topic_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./asssets/startupsize/startupsize.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    # print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        # print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        # print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        # print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }







def usercategories_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))

    print("test",I)
    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/user-categories', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("./assets/user-categories/terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    # print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    # print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/user-categories', 'usercategories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./asssets/user-categories/usercategories.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    # print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        # print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        # print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        # print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }







def new_categories_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []
    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/new-categories', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("./assets/new-categories/terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/new-categories', 'new-categories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./assets/new-categories/new-categories.json not found")
        return {"error": "unable to load topics.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }




def target_customer_predictor(idea):

    # this block cleans and parses the text
    try:
         #Convert to lower case
        processed_text = idea.lower()

        #Replace - with ' '
        processed_text = processed_text.replace('-',' ')
        stop_words = set(stopwords.words('english'))
        #tokenize words
        word_tokens = word_tokenize(processed_text)
        #filter stop words
        filtered_sentence = [w for w in word_tokens if not w in stop_words]
        #filter punctuations
        filtered_sentence = [ w for w in filtered_sentence if w.isalnum() ]

    except Exception as e:
        print("error in parsing",e)
        return {"error": "some error occured in parsing text" }

    # Initialise word vector I
    I = []

    #stem each word and add it to the word vector
    for word in filtered_sentence:
        I.append(ps.stem(word))


    # loop through terms.json and load it into Term vector
    try:
        terms_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/targetCustomer', 'terms.json')
        with open(terms_path, 'r') as file1:
            T = json.load(file1)["termList"]
    except:
        print("terms.json not found.")
        return {"error": "unable to load terms.json" }

    # Initialise the idea vector V with 0s
    V = [0] * (len(T))

    #initialise the intercept
    V[0] = 1
    print("vo", V)

    # Loop through terms and if found initialise ideavector with 1
    for i in range(1, len(V)):
        term = T[i]
        if term in I :
            V[i] = 1

    print("filled v ", V)
    # Load topics json
    try:
        topics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets/targetCustomer', 'categories.json')
        with open(topics_path, 'r') as f:
            TOPS = json.load(f)
    except:
        print("./assets/targetCustomer/categories.json not found")
        return {"error": "unable to load categories.json" }


    #initialise the prediction dic
    PRED = []

    print("pred")

    # loop through the topics and do a cumulative sum of products for weights with idea vector
    for i in range(len(TOPS)):

        print("looop for ", TOPS[i]["category"])
        cum_sum = 0
        W = TOPS[i]["weights"]
        cum_sum = W[0]*V[0]
        print("intercept ", cum_sum)
        for j in range(1, len(W)):
            #print(W[j],"*",V[j])
            cum_sum = cum_sum + W[j]*V[j]



        d = {}
        print("sum", cum_sum)
        #print(TOPS[i]["category"])
        d["topic"] = TOPS[i]["category"]
        d["pred"] = round(cum_sum, 5)
        # d["terms"] = TOPS[i]["topicTerms"]
        PRED.append(d)

    return {'idea' : idea , 'PRED' : sorted(PRED, key=itemgetter('pred'), reverse = True) }




app.run(host='0.0.0.0', port=7000)
