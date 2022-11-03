# Standard Callbacks

* [createOrder](#createOrder)
* [onApprove](#onApprove)
* [createVaultToken](#createVaultToken)

# createOrder

Callback used to create an order id, for any case involving a purchase.

This callback will be invoked whenever the user takes an action to submit the card fields (e.g. clicks the merchant-supplied button).

### Create order from server

```javascript
const createOrder = (data, actions) => {
    return fetch('/api/paypal/order', {
        method: 'POST'
    }).then(res => {
        return res.json();
    }).then(json => {
        return json.orderID;
    });
};
```

Setup your server to invoke the [Creat Order API](https://developer.paypal.com/docs/api/orders/v2/#orders_create). The button pressed on the client side will determine the "payment_source" that is sent in the below sample which presumes that in this case it was "Card".

#### Request 
**Create Order with Card as a Payment Source**
```
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders
-H "Content-Type: application/json" \
-H "Authorization: Bearer Access-Token" \
-d '{
    "intent": "CAPTURE",
    "purchase_units": [
        {
            "amount": {
                "currency_code": "USD",
                "value": "100.00"
            }
        }
    ],
}
```
#### Response
Pass the order.id to the PayPal JS SDK and it will update the order with the number, cvv, expiry date entered in a way such that the PCI burden in taken on by PayPal. 

```json
{
            "id": "5O190127TN364715T",
            "status": "CREATED",
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
                    "amount": {
                        "currency_code": "USD",
                        "value": "100.00"
                    }
                }
            ],
            "create_time": "2022-10-03T11:18:49Z",
            "links": [
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                    "rel": "self",
                    "method": "GET"
                },
                {
                    "href": "https://www.paypal.com/checkoutnow?token=5O190127TN364715T",
                    "rel": "approve",
                    "method": "GET"
                },
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                    "rel": "update",
                    "method": "PATCH"
                },
                {
                    "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T/capture",
                    "rel": "capture",
                    "method": "POST"
                }
            ]
        }
    }
```

## onApprove

Callback used to signal buyer approval of a purchase, e.g.

- Successfully entering a card and submitting it
- Clicking on a button and approving a payment

### Capture order from server

```js
const onApprove = (data, actions) => {
    return fetch('/api/paypal/order/capture', {
        method: 'POST',
        body: JSON.stringify({
            orderID: data.orderID
        })
    }).then(res => {
        return res.json();
    }).then(json => {
        // Show a success page
    });
};
```

Setup your server to invoke the [Capture Order API](https://developer.paypal.com/docs/api/orders/v2/#orders_capture).

#### Request

```
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders/<order_id>/capture \
-H "Content-Type: application/json" \
-H "Authorization: Bearer Access-Token" \
```

#### Response

```json
{
  "id": "some_id",
  "status": "COMPLETED",
  "payment_source": {
      "card": {
        "brand": "VISA",
        "last_digits": "1111",
        "type": "CREDIT"
      }
  },
  "purchase_units": [
    {
      "reference_id": "reference_id",
      "payments": {
        "authorizations": [
          {
            "id": "id",
            "status": "CREATED",
            "amount": {
              "currency_code": "USD",
              "value": "100.00"
            },
            "seller_protection": {
              "status": "ELIGIBLE",
              "dispute_categories": [
                "ITEM_NOT_RECEIVED",
                "UNAUTHORIZED_TRANSACTION"
              ]
            },
            "expiration_time": "2022-10-04T14:37:39Z",
            "links": [
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T",
                "rel": "self",
                "method": "GET"
              },
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T/capture",
                "rel": "capture",
                "method": "POST"
              },
              {
                "href": "https://api-m.paypal.com/v2/payments/authorizations/5O190127TN364715T/void",
                "rel": "void",
                "method": "POST"
              },
              {
                "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                "rel": "up",
                "method": "GET"
              }
            ]
          }
        ]
      }
    }
  ],
  "payer": {
    "name": {
      "given_name": "John",
      "surname": "Doe"
    },
    "email_address": "customer@example.com",
    "payer_id": "QYR5Z8XDVJNXQ"
  },
  "links": [
    {
      "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
      "rel": "self",
      "method": "GET"
    }
  ]
}
```