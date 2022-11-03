# Multi Card Fields

* [Rendering](#Rendering)
* [Callbacks](#Callbacks)
* [Styling](#Styling)
* [Eligibility](#Eligibility)
* [Validation](#Validation)
* [Methods](#Methods)

#### Rendering

```js
const cardFields = paypal.CardFields();

cardFields.NumberField().render('#card-number-field-container');
cardFields.CVVField().render('#card-cvv-field-container');
cardFields.ExpiryField().render('#card-expiry-field-container');
```

#### Styling

##### Properties

- `appearance`
- `color`
- `direction`
- `font`
- `font-family`
- `font-size`
- `font-size-adjust`
- `font-stretch`
- `font-style`
- `font-variant`
- `font-variant-alternates`
- `font-variant-caps`
- `font-variant-east-asian`
- `font-variant-ligatures`
- `font-variant-numeric`
- `font-weight`
- `letter-spacing`
- `line-height`
- `outline`
- `opacity`
- `padding`
- `text-shadow`
- `transition`
- `-moz-appearance`
- `-moz-osx-font-smoothing`
- `-moz-tap-highlight-color`
- `-webkit-osx-font-smoothing`
- `-webkit-tap-highlight-color`
- `-webkit-transition`

##### Selectors

- `:hover`
- `.valid`
- `.invalid`
- `@media`

##### Example

```js
const cardStyle = {
    'input': {
        'font-size': '16px',
        'font-family': 'courier, monospace',
        'font-weight': 'lighter',
        'color': '#ccc',
    },
    '.invalid': {
        'color': 'red',
    },
}

const cardPlaceholders = {
    number: 'XXXX-XXXX-XXXX-XXXX',
    expiry: 'MM/YY',
    cvv:    'CVV'
};

paypal.CardFields({
    style: cardStyle
}).render('#card-field-container');
```

#### Eligibility

##### Detect Eligibility

```js
const cardFields = paypal.CardFields({/* options */});

if (cardFields.isEligible()) {
    cardFields.NumberField().render('#card-number-field-container');
    cardFields.CVVField().render('#card-cvv-field-container');
    cardFields.ExpiryField().render('#card-expiry-field-container');
}
```

#### Validation

```js
const cardFields = paypal.CardFields({/* styleObject, createOrder, onApprove */});

const cardContainer = document.getElementById("#card-number-field-container")

const cardNumberField = cardFields.NumberField({
    // add valid or invalid class when the validation changes on the field
    onChange: (data) => {
        cardContainer.className = data.isValid ? 'valid' : 'invalid';
    }
})

```

#### Methods

# addClass

Add a class to a field. Useful for updating field styles when events occur elsewhere in your checkout

| Parameters | Type | Description |
|------------|------|-------------|
|classname   | string | The class to be added. |

```js
const cardField = paypal.CardFields({...})
const numberField = cardField.NumberField({...});
numberField.render(cardNumberContainer);
numberField.addClass("purple");
```

# clear

Clears the value of a field.

```js
const cardField = paypal.CardFields({...})
const nameField = cardField.NameField({...});
nameField.render(cardNameContainer);
nameField.clear();
```

# focus

Programmatically focus a field.

```js
const cardField = paypal.CardFields({...})
const nameField = cardField.NameField({...});
nameField.render(cardNameContainer);
nameField.focus();
```

# getState

Returns an object that includes the state of all fields and possible card types

# on

Subscribes a handled function to a named event.

# removeAttribute

Removes a supported attribute from a field.

| Parameters | Type | Description |
|------------|------|-------------|
|attribute | string | The name of the attribute you wish to remove from the field.|

```js
const cardField = paypal.CardFields({...})
const numberField = cardField.NumberField({...});
numberField.render(cardNumberContainer);
numberField.removeAttribute("placeholder");
```

# removeClass

Removes a class from a field. Useful for updating field styles when events occur elsewhere in your checkout.

| Parameters | Type | Description |
|------------|------|-------------|
|classname   | string | The class to be removed. |

```js
const cardField = paypal.CardFields({...})
const numberField = cardField.NumberField({...});
numberField.render(cardNumberContainer);
numberField.removeClass("purple");
```

# setAttribute

Sets an attribute of a field. Supported attributes are `aria-invalid`, `aria-required`, `disabled`, and `placeholder`.

| Parameters | Type | Description |
|------------|------|-------------|
|attribute | string | The attribute to be added to the field. |
|value | string | The value for the attribute |

```js
const cardField = paypal.CardFields({...})
const nameField = cardField.NameField({...});
nameField.render(cardNameContainer);
nameField.setAttribute("placeholder", "Enter your full name");
```
# setMessage

Sets a visually hidden message for screen readers on a field

| Parameters | Type | Description |
|------------|------|-------------|
|message | string | The message to set for screen readers. |

```js
const cardField = paypal.CardFields({...})
const nameField = cardField.NameField({...});
nameField.render(cardNameContainer);
nameField.setMessage("Please type your name as it appears on your credit card");
```

# submit

Submit the payment information

```js
// Add click listener to merchant-supplied submit button and call the submit function on the CardField component
  multiCardFieldButton.addEventListener("click", () => {
    cardField
      .submit()
      .then(() => {
        console.log("multi card fields submit");
      })
      .catch((err) => {
        console.log("There was an error with multi card fields: ", err);
      });
  });
```