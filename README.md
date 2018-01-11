# SpeechJS
Basic JS wrapper for the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

I found the standard API had issues with the continuous setting crashing the api when returning the second result, so created this helper to restart after every result in order to mimic the behaviour of an 'always on' mode.  
After a few minutes of running it can generate a 'network' error that also causes the api to stop responding. The only fix for that I could find was to recreate the SpeechRecogniton object.
  
## Usage:

```
let speech = new Speech( 
  
  [ 'specific', 'words', 'to', 'listen', 'for' ], // grammar list
  true, // always on
  function(result){ console.log(result) }, // handle result, string is returned
  function(error){ console.error(error) } // handle error, error is returned
  
);

speech.startListening();
```
