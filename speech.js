/**
  
  Speech
  
  Simple wrapper for the WebSpeech API ( https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API )

  I found the standard API had issues with the continuous setting crashing the api when returning the second result, 
  so created this helper to restart after every result in order to mimic the behaviour of an 'always on' mode.
  After a few minutes of running it can generates a 'network' error that also causes the api to stop responding. 
  The only fix for that I could find was to recreate the SpeechRecogniton object.

  Usage:

    let speech = new Speech( 
      [ 'specific', 'words', 'to', 'listen', 'for' ],
      true,
      function(result){ console.log(result) }
    )

    speech.startListening()

*/
export default class Speech
{

  /**
    new Speech()

    @param words : [ 'array', 'of', 'words', 'to', 'listen', 'for' ];
    @param alwaysOn : boolean value, mimic continuous behaviour via workarounds if true
    @param onSpeechResultCallback : ( optional ) Function called when speech result received
    @param onSpeechErrorCallback : ( optional ) Function called when an error is generated
  */
  constructor( words, alwaysOn, onSpeechResultCallback, onSpeechErrorCallback )
  {

    this.words = words;
    this.alwaysOn = alwaysOn;

    this.grammar = '#JSGF V1.0; grammar word; public <word> = ' + this.words.join( ' | ' ) + ';';

    this.callback = onSpeechResultCallback;
    this.errorCallback = onSpeechErrorCallback;
    
    this.initialiseAPI();

    this.speechRunning = false;
    this.needsRestart = false;

  }

  /* - - - - P U B L I C - - - - */

  /**

    Speech.startListening()

    Starts SpeechRecognition
  */
  startListening()
  {

    // already running, don't start another one
    if( this.speechRunning ) return;

    this.recognitionList.addFromString( this.grammar, 1 );
    this.recognition.grammars = this.recognitionList;
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.speechRunning = true;
    this.recognition.start();

  }

  /**

    Speech.restart()

    Ronseal - creates a new SpeechRecognition object, resets vars, the usual
  */
  restart()
  {

    console.warn( "Speech.js : restarting" );

    this.initialiseAPI();

    this.speechRunning = false;
    this.needsRestart = false;

    this.startListening();

  }

  /* - - - - P R I V A T E - - - - */

  /* Create the SpeechRecogniton and SpeechGrammarList objects and add event handlers */
  initialiseAPI()
  {

    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    this.recognition = new SpeechRecognition();
    this.recognitionList = new SpeechGrammarList();

    this.recognition.onresult = this.handleSpeechResult.bind( this );
    this.recognition.onspeechend = this.handleSpeechEnd.bind( this );
    this.recognition.onerror = this.handleSpeechError.bind( this );
    this.recognition.onend = this.handleRecognitionEnd.bind( this );

  }

  /* - - - - E V E N T S - - - - */

  /* Speech API has returned a result */
  handleSpeechResult( e )
  {

    var last = e.results.length - 1; // get last result
    var res = e.results[last][0].transcript.toLowerCase(); // convert to lower case
    while( res.charAt(0) == ' ' ) res.slice(0, 1); // strip spaces at start
    
    if( this.callback != null ) this.callback( res ); // return it via callback

  }

  /* Speech recognition has ended */
  handleSpeechEnd()
  {

    this.recognition.stop(); // stop the speech recognition

  }

  /* There was an error */
  handleSpeechError( e )
  {

    this.recognition.stop(); // *should* have already stopped, but ya know, just in case
    if( this.errorCallback != null ) this.errorCallback( e ); // report the error if needed

    if( e.error == 'network' ) this.returnNothing(); // return null result
    else this.needsRestart = true;
    
  }

  /* Speech Recognition successfully stopped */
  handleRecognitionEnd( e )
  {

    this.speechRunning = false;

    if( this.needsRestart && this.alwaysOn ) this.restart();
    else if( this.alwaysOn ) this.startListening();

  }

  /* returns null */
  returnNothing()
  {

    if( this.callback != null ) this.callback( null );

  }

}
