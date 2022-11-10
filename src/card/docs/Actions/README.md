## Save Action for Standalone Vault

# Example Merchant Page

```html
         <div id="card-name-field-container"></div>
         <div id="card-number-field-container"></div>
         <div id="card-expiry-field-container"></div>
         <div id="card-cvv-field-container"></div>

         <button id="multi-card-field-button" type="button">Save Card</button>

<script>

// Define Save action
const clickHandler = paypal.Save({
  onCreateVaultSetupToken: async () => {
    cosnt response = await fetch('/merchant/api/vault/setupToken', { method: 'POST' });
    const { setupToken } = response.json();
    return setupToken;
  },
  onApprove: (vaultToken) => {
    fetch('/merchant/api/vault', {
      method: 'POST',
      body: JSON.stringify({
        vaultToken
      })
    });
  }
});

// Create the Card Field Component
const cardField = paypal.CardFields(clickHandler);

// Create and render the individual Card Fields
cardField.nameField().render(document.getElementById('card-name-field-container'));
cardField.numberField().render(document.getElementById('card-number-field-container'));
cardField.expiryField().render(document.getElementById('card-expiry-field-container'));
cardField.cvvField().render(document.getElementById('card-cvv-field-container'));

document.getElementById('multi-card-field-button').onClick = clickHandler;
</script>
```

