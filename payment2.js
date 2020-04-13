$(document).ready(function(){
    $(window).keyup(function(e){
        var ESC = 27;
        if(e.keyCode == ESC){
            $('.modal-wrapper').hide();
        }
    });

    $('.modal-close').click(function(){
        $('.modal-wrapper').hide();
    });
});


function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    var form = document.getElementById('payment-form');
    var hiddenInput = $(form).find("*[name$='stripe_token']").get(0);
    hiddenInput.setAttribute('value', token.id);
    var post_data = $('#id_post_data').val($('#build-crossword').serialize())
    // Submit the form
    form.submit();
}


function initStripe(then){
    var script = document.createElement('script');
    script.onload = function(){
        $('#payment-form-wrapper').show();
        $('#payment-form-update-button').remove()
        var stripe = Stripe(window.STRIPE_PUBLIC_KEY);

        // Create an instance of Elements.
        var elements = stripe.elements();

        // Custom styling can be passed to options when creating an Element.
        // (Note that this demo uses a wider set of styles than the guide below.)
        var style = {
          base: {
            color: '#32325d',
            lineHeight: '18px',
            fontFamily: 'arial',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        };

        // Create an instance of the card Element.
        var card = elements.create('card', {style: style, hidePostalCode: true});

        // Add an instance of the card Element into the `card-element` <div>.
        card.mount('#card-element');

        // Handle real-time validation errors from the card Element.
        card.addEventListener('change', function(event) {
          var displayError = document.getElementById('card-errors');
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        });

        // Handle form submission.
        var form = document.getElementById('payment-form');
        form.addEventListener('submit', function(event) {
          $('#payment-button').prop("disabled", true);
          event.preventDefault();

          stripe.createToken(card).then(function(result) {
            if (result.error) {
              // Inform the user if there was an error.
              var errorElement = document.getElementById('card-errors');
              errorElement.textContent = result.error.message;
              $('#payment-button').prop("disabled", false);
            } else {
              // Send the token to your server.
              stripeTokenHandler(result.token);
            }
          });
        });

        if(then){
            then()
        }
    }
    script.src = "https://js.stripe.com/v3/"
    document.head.appendChild(script);
}
