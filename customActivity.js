define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';
    //var prodEnv = require('prod.env')
	//alert(JSON.stringify(prodEnv.env.clientid));
    var connection = new Postmonger.Session();
	var authTokens = {};
    var payload = {};
    
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Step 1", "key": "step1" },
        { "label": "Step 2", "key": "step2" }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
		
      
        // Disable the next button if a value isn't selected
        $('#journeytype').change(function() {
			 var filledform = getMessage();
		
		
			
            //var message = getMessage();
			
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(filledform.journeytype) });

            $('#message1').html("Fill all the relevant fields and click Next when you ready");
			$('#message').html(filledform.journeytype+"<br/>"+filledform.entrytype+"<br/>"+filledform.objective+"<br/>"+filledform.reason);
        });

     
    }

    function initialize (data) {
		var journeytype;
        var entrytype;
        var objective;
		var reason;
		
        if (data) {
            payload = data;
			
        }

        var message;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'journeytype') {
                    journeytype = val;
                }else if (key === 'entrytype') {
					entrytype = val;
				}else if (key === 'objective') {
					objective = val;
				}else if (key === 'reason') {
					reason = val;
				}
            });
        });
			$('#journeytype').val(journeytype);
			$('#entrytype').val(entrytype);
			$('#objective')	.val(objective);	
			$('#reason').val(reason);


		
		
        // If there is no message selected, disable the next button
        if (!journeytype) {
            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: false });
            // If there is a message, skip to the summary step
        } else {
          
            message = $('#journeytype').val(journeytype);
			message += $('#entrytype').val(entrytype);
			message += $('#objective')	.val(objective);	
			message += $('#reason').val(reason);

            $('#message').html(message);
            showStep(null, 2);
        }
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
		 //console.log(tokens);
       // authTokens = tokens;
	//	alert(JSON.stringify(authTokens));
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
		 console.log(endpoints);
    }

    function onClickedNext () {
        if (
            (currentStep.key === 'step1' && steps[1].active === false) || currentStep.key === 'step2'  ) {
            save();
        } else {
			onClickedNext
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                        button: 'next',
                        text: 'done',
                        visible: true
                    });
                break;
            
        }
    }

    function save() {
        var name = $('#journeytype').find('option:selected').html();
        var filledform = getMessage();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
      payload.name = filledform.journeytype+" "+filledform.entrytype+" "+filledform.objective;
console.log(name);
        payload['arguments'].execute.inArguments = [{ "message": filledform.journeytype+"<br/>"+filledform.entrytype+"<br/>"+filledform.objective+"<br/>"+filledform.reason}];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
		 var formvalues = {
            journeytype: "",
            entrytype: "",
            objective: "",
            reason: "",
			filled:false

        };
        formvalues.journeytype = $('#journeytype').find('option:selected').attr('value').trim();
		formvalues.entrytype = $('#entrytype').find('option:selected').attr('value').trim();
		formvalues.objective = $('#objective').find('option:selected').attr('value').trim();
		formvalues.reason = $('#reason').val();
		if ((formvalues.journeytype)&& (formvalues.entrytype)&& ((formvalues.objective)|| (formvalues.reason))){
			formvalues.filled = true;
		}
		
		return formvalues;
    }

});