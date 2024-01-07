# Checklist

## NOTES
I'm struggling with the navigation categories. I got them to work to some extent, but I have a desire to make them
this infinitely deep list that could be made. I don't know if it's worth it, but I think that checking out shutterfly will help me know.
If I don't do it now, it's not the end of the world it would just kind of suck for a second while migrating to the new system. So
perhaps I should ask nikki...

Either way, I really want to have the categories kind of up top, with a selection of products below. If you want to continue to wittle it down
you click on a category, otherwise you browse the products below. I also still need to figure out a search type thing, but I think that that comes after the
cart and checkout are done.

## Goals!
### Admin Panel Migrated - Dec 23rd
- [x] Orders
    - [ ] Basically done, but I need to get cart and checkout finished before I can finish this.
- [x] Inventory
- [x] User management
- [x] Privilege Groups
- [x] Navigation
- [x] Settings
### Product Navigation
### Cart and Checkout Finished - Dec 28th
- [x] Products show up
    - [x] Navigation Categories
    - [x] Navigate the products
- [x] Cart Functionality
    - [x] Add to cart
    - [x] Edit Cart
- [ ] Checkout Functionality
    - [x] Correct Price
    - [ ] Checkout with pay on pickup
        - [ ] Deny pay on pickup for large orders
    - [ ] Checkout with stripe
        - [x] Take care of sales tax on our side
        - [x] Send Shipping info to stripe
        - [x] Save Shipping info on our side
        - [ ] Send Taxes to Stripe
        - [ ] Add taxes to order
        - [ ] Go to a success page,
        - [ ] Set order to be paid on our side
        - [ ] Your order has finished email
        - [ ] Ensure pay on pickup doesn't work if not picking up
    - [ ] Shipping :)
        - [x] Pack boxes
        - [x] Implement individually shipped items
        - [x] Double check to make sure that searching for items by id won't mess everything up.
        - [x] Add weight to packed box type
        - [x] Interface with easy post
        - [x] Select Shipping at checkout
        - [x] Save packing on order. 
- [ ] Orders Show Up
    - [ ] Twill be easy
### Detail Work and Mobile Design - Dec 30th
### Deployed - Jan 6th

## Other things to Do 

### Important Detail Things
- [ ] Make the country code for shipping a selectable dropdown
- [ ] Shipping costs in utah are taxexempt if stated separately (not as part of the price of the product)
    however, if I bump up the cost of shipping to cover my own expenses are they still tax exempt?

### Auth
- [ ] Github sign up callback to account management
- [ ] Email Validation
- [ ] Reset Password


## Things to do after everything is hosted
- [ ] When an auth group gets deleted, what happens to the routes and users that are a part of that auth group?

## Ideas
- [ ] Make certain tags hideable from product pages (for example for tags that might only have to do with stores or something)
- [ ] Infinite-depth navigation categories, every navigation category has a reference to it's parent
