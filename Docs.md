

    Documentation
    Inspector

Apiary Powered Documentation

Sign in with Apiary account.
Download API Blueprint
Hyp Pay
Introduction
Welcome to Hyp
Getting Started

In this document, we will guide you through the process of setting your preferences to effectively use our API.

Pay_Protocol
Step 1 - Hyp Pay Portal

In Hyp Pay Portal , you can view your deals, invoices, standing orders, get reports, configure API settings , and much more. Use your credentials to connect to our system.
Step 2 - Setup
Authentication

There are three authentication methods you can choose to communicate with our servers. Each option is listed in the table below:
Defined method 	Desctiption 	Remarks
Domain authentication 	This option is suitable for users who want to process transactions from more than one webpage.
In this method, the domain from which the call is made is checked. If the check returns false, the request is denied. 	More than one Domain can be defined
IP address authentication 	This option is suitable for users who want to process transactions from only one webpage.
In this method, the IP address from which the call is made is checked. If the check returns false, the request is denied. 	More than one IP can be defined
Password authentication (PassP) 	Allows you to access the page by a visible password 	Suitable for a link that is redirected to the system from an unlimited number of addresses

You can setup your prefered authentication method via Settings - > Terminal settings. You can check the `Verify by signature in the payment page` option to enable verification on your payment page.

Our recommendation is to select the Verify by signature in the payment page box, use PassP by checking the option and add a password. In the image below you can see we selected the PassP option with the password 'hyp' authentication
Terminal (Masof) number and API Key

The API key is a unique identifier that represents you in our system, helping us verify transactions and protect your deals. You can view your API key in Settings -> Terminal Settings, as shown in the picture below. The Terminal (Masof) number is also listed in the picture above the API key.

apikey

Set Up Success and Failure Pages

Parameters of the transaction made on the payment page are redirected in the browser to the response pages that you can define. This way, you will know that a submission has been made on the payment page and what its status is.
A deal can either succeed or fail if unauthorized interference occurs or incorrect details are provided. In the case of a failure, there are two options:

    The user will see an error message and have the option to try again.
    The user will be redirected to a failure page.

Note that there are valid codes other than 0 that will still result in a failure page:

        600 - Checking a card number
        700 - Approved without charge
        800 - Postpone transaction

You can set up your success and failure pages to which the user will be redirected in Settings - > Terminal settings. See the picture below:

deal_redirect
Templates

You can choose to use Hyp Templates by using the option tmp=template_number.

click the link to see the templates and their numbers.

You can show the user the payment page in several ways. Change this setting in Settings -> Terminal Settings, as shown in the picture below.

template

Pay Protocol
General - Pay Protocol

Pay Protocol is a simple API allowing customers to perform transactions with credit cards.

        This method is suitable for website or shop owners who do not have an SSL encryption key.
        This method is approved for use by credit card companies without PCI compliance. The customer will push a button and be redirected to the Hyp Pay secure webpage.

All the parameters of Pay Protocol are listed HERE

Please note:
All the examples here will be using this current testing Masof.
Parameter 	Info 	Desciption
Masof 	0010131918 	Masof from settings page
PassP 	yaad 	PassP from settings page
KEY 	7110eda4d09e062aa5e4a390b0a572ac0d2c0220 	APIKey from settings page
Step 1 - APISign (Payment Page Request)

At this step you collect all the input that you need about the transaction:

ClientName,
ClientLName,
UserId,
email,
phone,
Amount,
etc'..


Add the following parameters : action=APISign , What=SIGN , Masof , KEY and PassP) to the parameters above to create a request

Example to GET Request :

https://pay.hyp.co.il/p/?action=APISign&What=SIGN&KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220&PassP=yaad&Masof=0010131918&Order=12345678910&Info=test-api&Amount=10&UTF8=True&UTF8out=True&UserId=203269535&ClientName=Israel&ClientLName=Isareli&street=levanon+3&city=netanya&zip=42361&phone=098610338&cell=050555555555&email=test@yaad.net&Tash=2&FixTash=False&ShowEngTashText=False&Coin=1&Postpone=False&J5=False&Sign=True&MoreData=True&sendemail=True&SendHesh=True&heshDesc=[0~Item 1~1~8][0~Item 2~2~1]&Pritim=True&PageLang=HEB&tmp=1

we get the following result :

Amount=10&ClientLName=Isareli&ClientName=Israel&Coin=1&FixTash=False&Info=test-api&J5=False&Masof=0010131918&MoreData=True&Order=12345678910&PageLang=HEB&Postpone=False&Pritim=True&SendHesh=True&ShowEngTashText=False&Sign=True&Tash=2&UTF8=True&UTF8out=True&UserId=203269535&action=pay&cell=050555555555&city=netanya&email=test%40yaad.net&heshDesc=%5B0~Item%201~1~8%5D%5B0~Item%202~2~1%5D&phone=098610338&sendemail=True&street=levanon%203&tmp=1&zip=42361&signature=908f05b9905e64bed97f3fbdb800151cb175069b5053bfda55d48d716db441c8

Notice we received a signature parameter in the return value. This signature will be useful in the next step of the verification process.

Please note that the signature is returned only when the Sign=True parameter is included in the request, and the Verify by signature in the payment page option is enabled in the terminal settings , which can be configured through our web portal after logging in with your credentials.
Step 2 - Generating the Payment Page Link

In this step, we generate the link for the payment page by appending the required parameters to https://pay.hyp.co.il/p/?.

Once the parameters are added, the resulting link can be used to redirect the user to the payment page.

Here is an example of the generated link:

https://pay.hyp.co.il/p/?action=pay&Amount=10&ClientLName=Isareli&ClientName=Israel&Coin=1&FixTash=False&Info=test-api&J5=False&Masof=0010131918&MoreData=True&Order=12345678910&PageLang=HEB&Postpone=False&Pritim=True&SendHesh=True&ShowEngTashText=False&Sign=True&Tash=2&UTF8=True&UTF8out=True&UserId=203269535&action=pay&cell=050555555555&city=netanya&email=test%40yaad.net&heshDesc=%5B0~Item%201~1~8%5D%5B0~Item%202~2~1%5D&phone=098610338&sendemail=True&street=levanon%203&tmp=1&zip=42361&signature=908f05b9905e64bed97f3fbdb800151cb175069b5053bfda55d48d716db441c8

Click HERE TO TEST THE LINK

If you click the link you will see a payment page with the relevant parameters you sent in step 1 like the picture below

payment
Step 3 - Success Page Redirect

Once the payment is filled correctly the user redirect to a success page🛈. in this case the link is : https://pay.hyp.co.il/yaadpay/tmp/apitest/yaadsuccesspagedemo.htm?Id=12788261&CCode=0&Amount=10&ACode=0012345&Order=12345678910&Fild1=Israel%20Isareli&Fild2=test%40yaad.net&Fild3=&Sign=13cccf141e2fc2e2dd8d8201a90d58929514d97e00084cb9436cab087f1ba8c6&Bank=6&Payments=1&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=098610338&Coin=1&Tmonth=03&Tyear=2023&errMsg=%20(0)&Hesh=31

Please note: The URL of the success page contains parameters that we use for the verification.
Example of Parameters in the Success Page URL

From the Id parameter till the end of the URL:

Id=12788261&CCode=0&Amount=10&ACode=0012345&Order=12345678910&Fild1=Israel%20Isareli&Fild2=test%40yaad.net&Fild3=&Sign=13cccf141e2fc2e2dd8d8201a90d58929514d97e00084cb9436cab087f1ba8c6&Bank=6&Payments=1&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=098610338&Coin=1&Tmonth=03&Tyear=2022&errMsg=%20(0)&Hesh=31
Step 4 - Verification

We use the parameters from the last step and add them to the following link using the following parameters:

    action=APISign

    What=VERIFY

    PassP

    KEY

    Masof

    Note:
    This step is possible only if the Verify by signature in the payment page option is enabled in the terminal settings.
    You can configure this setting through our web portal by logging in with your credentials.

Example of the Verification Link: :

https://pay.hyp.co.il/p/?action=APISign&What=VERIFY&KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220&PassP=yaad&Masof=0010131918&Id=12788352&CCode=0&Amount=10&ACode=0012345&Order=12345678910&Fild1=Israel%20Isareli&Fild2=test%40yaad.net&Fild3=&Sign=f7c8f8e89a0463cf0a5b258033af4c662236b601361c7c44e4d3e98f8ddb8e7d&Bank=6&Payments=1&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=098610338&Coin=1&Tmonth=03&Tyear=2020&errMsg=%20(0)&Hesh=32

Click HERE TO TEST THE LINK

Notice we got CCode=0 - That means that the deal is verified !

Else we would get CCode=902 - That means that we got an error !

All the parameters of Pay Protocol are listed in HERE
Parameters - Pay Protocol
Parameter name 	Description 	Value format 	Requierd 	General
action 	Description of data transfer protocol method 	pay 	Requierd 	
Masof 	Terminal number in Hypay 	10 digits 	Requierd 	If a terminal number starts at 00100, it is a test terminal for testing and development without a real charge.
If it starts with a digit other than 0, it is a real terminal.
Info 	Transaction information 	Alpha numeric 	Requierd 	Open text that will be displayed next to each transaction in both the report and the management system, can be searched on the management system.
UTF8 	The data is encoded in utf-8 	True / False
defualt set to False 	Requierd 	
Sign 	Sign on sent parameters in answer 	True / False
defualt set to False 	Requierd 	
UTF8out 	Return answer in utf-8 encoding 	True / False
defualt set to False 	Requierd 	
Amount 	The purchase amount 	Numbers Only, if no amount is transferred, the client will be asked to type an amount (mainly suitable for donation). 	Optional 	
Order 	Optional field for the website owner 	The value is returned to the answer address and not saved in Hypay servers 	Optional 	
Tash 	Max number of payments that can be selected by the customer 	Only numbers 	Optional 	For Example, if Tash =4, the customer in the payment pay can choose up to 4 payments.
tashType 	Payment type 	regular = 1
credit =6 	Optional 	The customer's credit card company must be authorized to execute a credit transaction.
This parameter does not support Upay
FixTash 	Set payments to a fixed number, and close the option to the customer 	True / False
defualt set to False 	Optional 	Requiers Tash parameter
sendemail 	Send the customer a payment confirmation by email 	True / False
defualt set to False 	Optional 	the email would be sent to the mail inserted to email parameter
TashFirstPayment 	Different first payment 	Amount of first payment 	Optional 	
MoreData 	Return more data on the transaction 	True / False
defualt set to False 	Optional 	
pageTimeOut 	set timeout of 20 minutes to the payment page 	True / False
defualt set to False 	Optional 	recommended
PageLang 	Language of payment page 	HEB = hebrew
ENG = english 	Optional 	
tmp 	Template number 	1 - infinity 	Optional 	Allows you to work with an infinite number of payment page templates
Coin 	Billing currency 	1 - ILS/שקל
2 - USD/דולר
3 - EURO/אירו
4 - POUND/פאונד 	Optional 	Defualt set to ILS
Postpone 	Delayed transaction - code 800 	True / False
defualt set to False 	Optional 	
J5 	Preserving line of credit
J2/J5 A suitable working method for Tokens and external software 	J5 = J2
J5 = True
defualt set to False 	Optional 	J5 = presrving credit line for 3 days without cancel option
J2 = check only credit card credebility without checking credit line
ShowEngTashText 	Showing Tash text in ENG 	True/ False 	Optional 	
Client data parameters - Pay Protocol
Parameter name 	Description 	Value format 	Requierd 	General
UserId 	ID 	client ID , in case the credit card company dosn't require ID, you can send 9 zero's 	Requierd 	It is recommended that the customer fill this field on the payment page without having to send it
If a request is submitted to open a template in English, there must sent UserId = 000000000 or UserId = L Customer number.
This parameter appears on the invoice in the default format
ClientName 	client name 	Text/ Number 	Requierd 	Must be sent if the customer is not required to fill out the payment page
ClientLName 	client name 	Text/ Number 	Optional 	
street 	street name and house number 	Text/ Number 	Optional 	This parameter appears on the default invoice
city 	city name 	Text/ Number 	Optional 	This parameter appears on the default invoice
zip 	zip code 	Text/ Number 	Optional 	This parameter appears on the default invoice
phone 	phone number 	Number 	Optional 	
cell 	cell number 	Number 	Optional 	
email 	client email 	email address 	Optional 	This parameter is not checked for email regex
EzCount Invoice parameters - Pay Protocol (Terminal allowed to work with EzCount)
Parameter name 	Description 	Value format 	Requierd 	General
SendHesh 	send invoice in email 	True / False
defualt set to False 	Optional 	invoice would be sent to the mail in email parameter
heshDesc 	Different desctiption to the invoice 	Text/ Number or items values 	Optional 	Requierd if Pritim equals True
Pritim 	The invoice description contains items 	True / False
defualt set to False 	Optional 	see article on Invoices
blockItemValidation 	Force strict validation of item totals 	True / False
default set to False 	Optional 	When set to True, if the sum of items in heshDesc does not match the total transaction amount, the transaction will be blocked with CCode=400
EZ.lang 	Language of invoice and email 	he = for Hebrew
en = for English 	Optional 	he = for Hebrew doc (this is the default)
EZ.email_text 	Add additional text into the body of an email 	Text 	Optional 	
EZ.comment 	Add additional text into the body of a invoice document 	Text 	Optional 	
EZ.cc_emails 	An array of valid cc emails the invoice will be sent to 	Text 	Optional 	Limited to 10 emails
EZ.vat 	The invoice VAT if not supported the current VAT will be used 	Number only 	Optional 	Default = 0.18,
1 = 1.00,
0 = 0.00
EZ.description 	Add additional description into the body of a invoice document 	Text 	Optional 	Inserts text in the header of an invoice
EZ.customer_crn 	The customer company number/ID/ etc… (BN Number) 	Numbers only 	Optional 	Required by law when document value is greater than 5,000 ILS
EZ.create_org_as_foreign 	Default 0.
use when you have permission to create original documents in English or foreign currency. 	Boolean (0/1) 	Optional 	Israelis can’t create the original documents in English or not in ILS, so we create a copy and send a translated copy to the customer.
Subscription - HK - Pay Protocol
Parameter name 	Description 	Value format 	Requierd 	General
HK 	Pay Page in HK mode 	True / False
defualt set to False 	Optional 	Additional info in HK article
freq 	payment frequency 	Number in months 	Optional 	
FirstDate 	First payment date 	YYY-MM-DD 	Optional 	
Tash 	Number of payments 	Number of payments 	Requierd 	For HK without limit insert 999
OnlyOnApprove 	only if the first payment is approved the deal is closed 	True / False
defualt set to False 	Optional 	
Step 5 - Pay Protocol - Returned parameters from credit card company
Parameter name 	Description 	Value format 	General
Id 	Transaction Id in Hypay 	Numbers only 	shown to the client in the payment confirmation
CCode 	Credit card company answer 	Number only 	Error between 0-200 is an error from Shva.
201-999 Hypay Error
see details on errors Article
Amount 	Amount actually charged 		
ACode 	confirmation code from credit card company 	Numbers only or letters 	if it's a tourist credit it would be a combination of the two
Order 	internal field for the website owner 		not saved in Hypay servers
Fild1 	Client first and last name 		
Fild2 	Client email 		
Fild3 	Client phone number 		
Sign 	Sign on sent parameters 		only if in the sent transaction Sign was set to True
If MoreData was set to True this additional fields would show
Parameter name 	Description 	Value format 	General
Bank 	סולק 		Isracard = 1
Visa Cal = 2
Diners = 3
Amex = 4
Leumi Card = 6
BIT = 99
TransType 	אופי העסקה 		Contactless
EMV Contactless
Mobile-CTL מגנטי
EMV Mobile-CTL
מספר טלפון נייד
EMV Contact
טלפונית
חתימה בלבד
אינטרנט-מאובטחת
fallback
PayWithMax
ApplePay
GooglePay
שירות עצמי
Payments 	Number of payments charged 		
UserId 	Clients ID 		
Brand 	Brand 		PL = 0
MasterCard = 1
Visa = 2
Diners = 3
Amex = 4
Isracard = 5
Issuer 	Credit card issuer 		Isracard = 1
Visa Cal = 2
JCB = 5
Leumi Card = 5
L4digit 	Credit card last 4 digits 		
street 	street 		
city 	city 		
zip 	zip 		
cell 	cell 		
Coin 			1 - ILS/שקל
2 - USD/דולר
3 - EURO/אירו
4 - POUND/פאונד
Tmonth 	Month credit card validity 		MM format
Tyear 	Year credit card validity 		YYYY format
Hesh 	Invoice number 		if invoice module is not active Hesh would get 0
UID 	UID unique value recieve from response after successful transaction
from request with action pay/soft 		Used for future purposes, for binding between steps of a transaction.
For example implementation a charge of the J5 transaction
spType 	Special card type 		00 – Default
01 – Immediate
70 – Club
03 – Petrol card
04 – Dual card
74 – Dual club
75 – Petrol club
06 – Chrageable
08 – Petrol
99 – Tourist card
bincard 	(BIN) refers to the first six numbers on a payment card 		
Returned data method

The data would be returned to the success or failure address that is changable only by Hypay. In get format the data would be returned according the credit card company answer. It is not requierd that the returned address would be protected by SSL.
Example for MoreData not equale to True

https://pay.hyp.co.il/?Id=5211854&CCode=0&Amount=100&ACode=0012345&Order=12345678910&Fild1=Michael Isarel&Fild2=&Fild3=&Sign=b1d92c04c0a396233dcdd354f2796c623d5c424ac884c20c4d9ec7d19cbbe6da

Example for MoreData equale to True

https://pay.hyp.co.il/?Id=5251622&CCode=0&Amount=100&ACode=0012345&Order=12345678910&Fild1=Michael%20Isarel&Fild2=&Fild3=&Sign=f5d7eed14157d9d9fb7852fb902d258f7cabed883f7f7df67ed8ff1a8519ca89&Bank=6&Payments=1&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=0506400013&Coin=1&Tmonth=1&Tyear=2019&Hesh=1751

Testing Credit Card

Number : 5326105300985614
ValidityDate : 12/25
CVV : 125
ID : real id number Or 890108566 Or 000000000

It is recommended to make the transaction with low amounts (5 NIS, 10 NIS, etc.)
If you want to simulate a failure use real credit card, who in testing terminal would get decline.





Apple Pay and Google Pay Integration

Apple Pay and Google Pay buttons provide a seamless and secure way for your customers to complete transactions. Depending on your implementation method, follow the appropriate steps for either Redirect or IFRAME.
Note: Additional domain verification and script requirements apply only to Apple Pay in an IFRAME implementation. Google Pay does not require these steps.
Redirect Implementation

If your payment page🛈 uses a Redirect, integrating Apple Pay and Google Pay is simple:

    Enable in the Merchant Console:
        Navigate to the Merchant Console.
        Go to the "Settings" menu.
        Enable Apple Pay and Google Pay options.
        Alternatively, contact your sales representative for assistance.

    Automatic Button Display:
        Once enabled, the Apple Pay and Google Pay buttons will appear automatically on your payment page.
        Note: Neither Apple Pay nor Google Pay require additional setup when using the Redirect method.

IFRAME Implementation

If your payment page is displayed within an IFRAME, additional steps are required specifically for Apple Pay:

    Enable in the Merchant Console:
        Navigate to the Merchant Console.
        Go to the "Settings" menu.
        Enable Apple Pay and Google Pay options.
        Alternatively, contact your sales representative for assistance.

    Domain Verification (Apple Pay Only):
        Download the Apple Pay verification file from the following URL: Download Verification File
        Upload this file to the following directory on your website:

        https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association

    Include the Required Script (Apple Pay Only):
        Add the following script to the <head> section of your website:

        <script src="https://pps.creditguard.co.il/plugins/applePayOnIframe.js"></script>

    HTTPS Requirement (Apple Pay Only):
        Ensure your domain is HTTPS-enabled before proceeding with the domain verification process.

    Adding the Domain in the Interface (Apple Pay Only):
        After the domain is verified, go to the "Apple Pay" section in the "Settings" menu of the Merchant Console.
        Add the domain under the "Apple Pay" section to complete the configuration.

    Confirming Button Appearance:
        After adding the domain, check your payment page within the IFRAME to confirm that the Apple Pay button appears and functions correctly.
        Note: This step is not required for Google Pay, as it does not rely on domain verification or script inclusion.

Notes

    For Apple Pay in an IFRAME, the button will not function properly until all steps, including script addition and domain verification, are completed.

    Google Pay does not require domain verification or script inclusion, regardless of the implementation method.

    The domain verification process for Apple Pay is a one-time setup. However, changes to your domain or hosting may require re-verification.

    Ensure that all configuration steps are completed before attempting a live transaction with Apple Pay.

Transaction J5

If a pay request/soft request was made with parameter J5=True and parameter MoreData=True. There are two methods to implement a charge of the J5 transaction.
If Amount of charge equal or less from Amount J5 Transaction

If you want to charge a same transaction with same amount or amount less from amount J5 transaction - you can do it with soft request with additional parameters.
Reference url is:

https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl?
+
Token flow subject parameters
+
Additional parameters
Additional parameters:
Parameter name 	Description 	Value format 	Requierd 	General
inputObj.originalUid 	UID unique value recieve from response after successful transaction from request with action pay/soft 	Numeric 	Requierd 	
inputObj.originalAmount 	Amount should be equal or less from amount J5 transaction 	Numeric
500 - Equals to 5 Shekels 	Requierd 	
AuthNum 	Approval from credit card company
value equal to parameter ACode from response
after successful pay 	Numeric 	Requierd 	
inputObj.authorizationCodeManpik 	Default Static SHVA parameter 	7 	Requierd 	
If Amount of charge is bigger from Amount J5 Transaction

If you want to charge a same transaction with amount bigger from amount J5 transaction - you need follow Token flow subject without additional parameters.





Selecting template

In order to use our templates you need to send tmp parameter with your pay POST call.
Our templates
Defualt template no need to send tmp parameter 	This template can be achived by sending tmp=1
	
This template can be achived by sending tmp=2 	This template can be achived by sending tmp=3
	
This template can be achived by sending tmp=4 	This template can be achived by sending tmp=5
	
This template can be achived by sending tmp=6 	This template can be achived by sending tmp=7
	
This template can be achived by sending tmp=8 	This template can be achived by sending tmp=9
	
This template can be achived by sending tmp=10 	This template can be achived by sending tmp=11
	
This template can be achived by sending tmp=12 	This template can be achived by sending tmp=13
	
This template can be achived by sending tmp=14 	This template can be achived by sending tmp=15
	

For the same template in english send PageLang=ENG
Tokens
General - Tokens

    The porpose of this protocol is to let the owner of the terminal save a token who replaces the credit card information for placing a deal.

    To get a Token you first need to make a transaction using Pay / Soft protocols.

    The deal need to be in one of the next Statuses:

        Approved - regular transaction
        600 - Checking a card number
        700 - approved without charge
        800 - postpone transaction
        998 - canceled transaction

    The token dosn't have validity date (תוקף) or usage restrict

    The token will always have 19 digits

    Note, The user info and credit card validity are not Saved in Hypay, you need to save them when your making the Token, so you could pass them when you pass new deal.

Step 1 - Tokens - Set up an authentication method

The authentication method is based on the console setting and can be one of the following:
Defined method 	Desctiption 	Remarks
IP address authentication 	This option is compatible for a user who want to pass deals from only one webpage.
In this method the IP address the call is made from is checked, in case the check returns false the request is denied 	More than one IP can be defined
Password authentication (PassP) 	Allows you to access the page by a visible password without the need for authentication 	Suitable for a link that is redirected to the system from an unlimited number of addresses
Step 2 - Tokens - An example for an answer from Pay Protocol

https://pay.hyp.co.il/yaadpay/tmp/apitest/yaadsuccesspagedemo.htm?Id=12788261&CCode=0&Amount=10&ACode=0012345&Order=12345678910&Fild1=Israel%20Isareli&Fild2=test%40yaad.net&Fild3=&Sign=13cccf141e2fc2e2dd8d8201a90d58929514d97e00084cb9436cab087f1ba8c6&Bank=6&Payments=1&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=098610338&Coin=1&Tmonth=03&Tyear=2023&errMsg=%20(0)&Hesh=31

For the sake of the Token request, only a number of transactions should be reserved / sent. It is also recommended to keep the identity card of the cardholder, which in most cases is a credit card company in order to make a deal with the Token
Step 3 - Tokens - Send a request to get a Token

A reference address is https://pay.hyp.co.il/p/ A shortened address for all protocols in the system You can make a call in get or POST format Note the uppper and lowercase letters exactly as in the parameters table:
Field Name 	Value format
action 	getToken
Masof 	Terminal number in Hypay servers
TransId 	Transaction number
Fild1 	Free filed that is returned with the answer and not saved in Hypay servers
Fild2 	Free filed that is returned with the answer and not saved in Hypay servers
Fild3 	Free filed that is returned with the answer and not saved in Hypay servers
allowFalse = True 	In order to allow the acceptance of a Token for a transaction that did not receive proper status, the parameter must be added
PassP 	Authentication with password, Requierd if this your chosen authentication method
Example for http POST request

<form action="https://pay.hyp.co.il/p/" method="post" >

<input type="hidden" name="action" value="getToken">
<input type="hidden" name="Masof" value="0010020610"> 
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="TransId" value="5211854">
<input type="hidden" name="Fild1" value="test">
<input type="hidden" name="Fild2" value="demo">
<input type="hidden" name="Fild3" value="order1234">

<input type="submit" value="getToken">


</form>

Example for http GET request

https://pay.hyp.co.il/p/?action=getToken&Masof=0010020610&PassP=1234&TransId=5211854&Fild1=test&Fild2=demo&Fild3=order1234

Tokens - Returned Parameters
Field name 	Value format
Id 	Transaction number
CCode 	Status code of the performed action. 0 if the action was valid, else error according to the error code table
Token 	Token number - 19 digits
Tokef 	credit card valitity date in the format YYMM (need's to be saved for further use
Fild1 	Free filed that is returned with the answer and not saved in Hypay servers
Fild2 	Free filed that is returned with the answer and not saved in Hypay servers
Fild3 	Free filed that is returned with the answer and not saved in Hypay servers
Step 4 - Tokens - Commit a transaction with a Token

    Making a deal with Token is done using soft protocol, see article about.

    When receiving the response the validity comes as one parameter in the YYMM format for performing a soft protocol transaction, you'll need to divide it to two parameters like the answer returned from pay protocol

    Tmonth=mm&Tyear=yyyy

Step 5 - Tokens - Common errors in this protocol that returned in CCode
Error number 	Reason
901 	No permission for this action
902 	Authentication failure Verify the authentication settings in the terminal
910 	A Token request from an invalid transaction. allowFalse = True should be added to the request
990 	At the time of the transaction only the token does not exist

After receiving the token, a transaction can be made with the token for another terminal by sending the parameter tOwner = a terminal number with the corrected asset

In order to use this service, you must request appropriate authorization from technical support
Soft Protocol - Transaction in web server
General - Soft Protocol - Transacion in web server

This method enables the transfer of transactions from a software / server via the Internet.

It has an option of making transactions through Pay Page and then making transactions via Token through the soft protocol.

The purpose of working with soft protocol is to create a deal with Token. You can use with Credit card systems in PCI enviornment or when the credit card company doesn't require to use PCI.
Step 1 - Soft - Set up an authentication method

The authentication method is based on the console setting and can be one of the following:
Defined method 	Desctiption 	Remarks
IP address authentication 	This option is compatible for a user who want to pass deals from only one webpage.
In this method the IP address the call is made from is checked, in case the check returns false the request is denied 	More than one IP can be defined
Password authentication (PassP) 	Allows you to access the page by a visible password without the need for authentication 	Suitable for a link that is redirected to the system from an unlimited number of addresses
Step 2 - Soft - Transaction data transfer method

A reference address is https://pay.hyp.co.il/p/ A shortened address for all protocols in the system

You can make a call in get or POST format Note the uppper and lowercase letters exactly as in the parameters table: To use the protocol we define action=soft and CC = Token_NUMBER Please Note : Token_NUMBER is the Token number we get from Get Token Step.

Example of GET request (you can also use POST ): https://pay.hyp.co.il/p/?action=soft&Masof=0010131918&PassP=yaad&Amount=10&CC=1315872608557940000&Tmonth=4&Tyear=2020&Coin=1&Info=test-api&Order=12345678910&Tash=2&UserId=203269535&ClientLName=Israeli&ClientName=Israel&cell=050555555555&phone=098610338&city=netanya&email=testsoft@yaad.net&street=levanon+3&zip=42361&J5=False&MoreData=True&Postpone=False&Pritim=True&SendHesh=True&heshDesc=%5B0~Item+1~1~8%5D%5B0~Item+2~2~1%5D&sendemail=True&UTF8=True&UTF8out=True&Fild1=freepram&Fild2=freepram&Fild3=freepram&Token=True We get the following response : Id=12852058&CCode=0&Amount=10&ACode=0012345&Fild1=freepram&Fild2=freepram&Fild3=freepram&Hesh=49&Bank=6&tashType=&Payments=2&noKPayments=1&nFirstPayment=5&firstPayment=5&TashFirstPayment=&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&firstname=Israel&lastname=Israeli&info=test-api&street=levanon%203&city=netanya&zip=42361&cell=050555555555&email=testsoft%40yaad.net&Coin=1&Tmonth=04&Tyear=2020&CardName=%28%3F%3F%3F%3F%29%20Cal&errMsg= (0)

Run the post request in postman: Run in Postman
Parameters - Soft
Parameter name 	Description 	Value format 	Requierd 	General
action 	Description of data transfer protocol method 	soft 	Requierd 	
Masof 	Terminal number in Hypay 	10 digits 	Requierd 	If a terminal number starts at 00100, it is a test terminal for testing and development without a real charge.
If it starts with a digit other than 0, it is a real terminal.
Info 	Transaction information 	Alpha numeric 	Requierd 	Open text that will be displayed next to each transaction in both the report and the management system, can be searched on the management system.
UTF8 	The data is encoded in utf-8 	True / False
defualt set to False 	Optional 	
UTF8out 	Return answer in utf-8 encoding 	True / False
defualt set to False 	Optional 	
Amount 	The purchase amount 	xxxx or xxxx.xx 	Requierd 	
Tash 	installments 	Only numbers 	Optional 	For Example, if Tash=4
tashType 	Payment type 	regular = 1
credit =6 	Optional 	The customer's credit card company must be authorized to execute a credit transaction.
This parameter does not support Upay
PassP 	Authentication with password 	Value from client service 	Optional 	
sendemail 	Send the customer a payment confirmation by email 	True / False
defualt set to False 	Optional 	the email would be sent to the mail inserted to email parameter
TashFirstPayment 	Different first payment 	Amount of first payment 	Optional 	
MoreData 	Return more data on the transaction 	True / False
defualt set to False 	Optional 	
CC 	Number of Token 	Numbers only 	Requierd 	
cvv 	Credit card code ( last 3 digits in the back ) 	Numbers only, needs to be defined in the terminal 	At the demand of the credit card company 	Not saved in Hypay servers and are not alowed to be saved anywhere
Tmonth 	Month credit card validity 	MM format 	Requierd 	
Tyear 	Year credit card validity 	YYYY format 	Requierd 	
Coin 	Billing currency 	1 - ILS/שקל
2 - USD/דולר
3 - EURO/אירו
4 - POUND/פאונד 	Optional 	defualt ILS
AuthNum 	confirmation number 	Broadcast a transaction using an existing confirmation number 	Optional 	Please note that the confirmation number can not be validated
Postpone 	Delayed transaction - code 800 	True / False
defualt set to False 	Optional 	
Token 	Making a deal with token 	True / False
defualt set to False 	Optional 	Committed to executing a transaction with token
tOwner 	Making a transaction from a different terminal than the token owner 	The terminal number of the owner of the token 	Optional 	Is subject to a special authorization given by the support
J5 	Preserving line of credit
2/J5 A suitable working method for Tokens and external software 	J5 = J2
J5 = False
defualt set to False 	Optional 	J5 = presrving credit line for 3 days without cancel option
J2 = check only credit card credebility without checking credit line
sendHeshSMS 	The invoice send by SMS to cell parmter 	True / False
defualt set to False 	Optional 	see article on Invoices must be send cellular number in cell parmter and buy package of sms bank
ApplePay and GooglePay

All the usual parameters that sent in the Soft request, will be sent here as well without change, in addition to another parameter called: WalletToken. This parameter is instead of the regular payment details – CC + Tmonth + Tyear The Soft request need to send like that:

    https://pay.hyp.co.il/p/?action=soft&Masof=0010131918&PassP=yaad&Amount=10&Coin=1&Info=test-api&Order=12345678910&Tash=2&UserId=203269535&ClientLName=Israeli&ClientName=Israel&cell=050555555555&phone=098610338&city=netanya&email=testsoft@yaad.net&street=levanon+3&zip=42361&J5=False&MoreData=True&Postpone=False&Pritim=True&SendHesh=True&heshDesc=%5B0~Item+1~1~8%5D%5B0~Item+2~2~1%5D&sendemail=True&UTF8=True&UTF8out=True&Fild1=freepram&Fild2=freepram&Fild3=freepram&WalletToken={"signature":"MEUCIQDhJ+oEJPWehLIsfbgqZpU/kfl76uB8Hej9ZNqIPZPOPAIgY4LVxUbMXK+Zwgm6lNjPKi0glmsFKLCIStFuZCi6E0I\u003d","intermediateSigningKey":{"signedKey":"{\"keyValue\":\"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE09EkTgH+wdZFuUxMstOhaU2/aW/jWeJ/CSlUDIru4VALhfoQ/NlGsQ2HmX1Gk0WQyMsfgXXSCdmjlzLOXPn+OA\\u003d\\u003d\",\"keyExpiration\":\"1642788088880\"}","signatures":["MEYCIQDYOHBu5+/OJXN0IoM79meNTZy0ktfqqhrjHZDpD/ky6wIhAJWIRofLkJDh/WuU4Y0C2JoFiC5ft0OL+hAfjOyL5HRe"]},"protocolVersion":"ECv2","signedMessage":"{\"encryptedMessage\":\"Hsor2M32v7Im4OG184Fw92FkNZ//vOfII7Dc6Mv3t/CsZ3nSvAsiXgoYOJimoq+tCUzMjDfcIM/G0JlPK93W/thPDGt0NL2gXXYw9YFHwrbb3+8GKk0uv8qzcx0P6AZDPwAP500PoweDpTtzHNnzRsuI8l5VpQX3pNgezMIH03kcZdNOTQbuWG6iTsOeY52zCRP8EQglJId4IrLIeCh4z+8fFBlpOql3xYKuo64hrjst4gCWwqDyzc48pykr1XE1yXewsB2olp5AoLUI9zKRr9PX6E4uQ1KmLGSagv51RPuJDOnQLlp9JL880Dtt48D9M2b40ln3kCPoWUjLwyb3rhkiKE2kurYBB7y4xdQZ33HLA16NUuxXXzlq+ta3w/hh0a5aZQ0G5oUc0SQynbKWAmwj0zuP9iVRabdDAeWGC6fg7hmeaDcU8fvhWoClKtjy7EULcI7JIy0rfXzc2OgTfgN87Z0mCXCIkSeeSJPxVd617MbxNbfcI6PjlVWKa2Wp/DLb0EMILW1Hr7eqxzvOGrl8H8U0M5ApRrAtIR0NtWLfx/6ajMkRj+HAsZFoAjp7gdkK2SjXC1wI9WCbPrsCZmHQQiZA2Q3Pu4Mmmujq6hI3uIp0ETzm+9mzFpnDzol5Nz3yfYm86EJB0Q\\u003d\\u003d\",\"ephemeralPublicKey\":\"BMjb6m+MIAxs/vNKiVW11Ly6tWoEtY/HW7joDzsbG8kzQP1pLEWID7FSEOt6SGNNs5m8gv6FeWgiSPRTREFGRQU\\u003d\",\"tag\":\"3ZpexlhtGG1ILR0WNBK510ycKbBiAkXgHFQ8nK53FtI\\u003d\"}"}

The Soft response need to look like this:

    Id=12852058&CCode=0&Amount=10&ACode=0012345&Fild1=freepram&Fild2=freepram&Fild3=freepram&Hesh=49&Bank=6&tashType=&Payments=2&noKPayments=1&nFirstPayment=5&firstPayment=5&TashFirstPayment=&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&firstname=Israel&lastname=Israeli&info=test-api&street=levanon%203&city=netanya&zip=42361&cell=050555555555&email=testsoft%40yaad.net&Coin=1&Tmonth=12&Tyear=2027&CardName=%28%3F%3F%3F%3F%29%20Cal&errMsg= (0)

Optional field for the website owner

    The value is returned to the answer address and not saved in Hypay servers

Parameter name 	Description 	Value format 	Requierd 	General
Fild1 	free text 		Optional 	
Fild2 	free text 		Optional 	
Fild3 	free text 		Optional 	
Client data parameters - Soft
Parameter name 	Description 	Value format 	Requierd 	General
UserId 	ID 	client ID , in case the credit card company dosn't require ID, you can send 9 zero's 	Requierd 	It is recommended that the customer fill this field on the payment page without having to send it
If a request is submitted to open a template in English, there must sent UserId = 000000000 or UserId = L Customer number.
This parameter appears on the invoice in the default format
ClientName 	client name 	Text/ Number 	Requierd 	Must be sent if the customer is not required to fill out the payment page
ClientLName 	client name 	Text/ Number 	Optional 	
street 	street name and house number 	Text/ Number 	Optional 	This parameter appears on the default invoice
city 	city name 	Text/ Number 	Optional 	This parameter appears on the default invoice
zip 	zip code 	Text/ Number 	Optional 	This parameter appears on the default invoice
phone 	phone number 	Number 	Optional 	
cell 	cell number 	Number 	Optional 	
email 	client email 	email address 	Optional 	This parameter is not checked for email regex
EzCount Invoice parameters - Soft Protocol (Terminal allowed to work with EzCount)
Parameter name 	Description 	Value format 	Requierd 	General
SendHesh 	send invoice in email 	True / False
defualt set to False 	Optional 	invoice would be sent to the mail in email parameter
heshDesc 	Different desctiption to the invoice 	Text/ Number or items values 	Optional 	Requierd if Pritim equals True
Pritim 	The invoice description contains items 	True / False
defualt set to False 	Optional 	see article on Invoices
blockItemValidation 	Force strict validation of item totals 	True / False
default set to False 	Optional 	When set to True, if the sum of items in heshDesc does not match the total transaction amount, the transaction will be blocked with CCode=400
EZ.lang 	Language of invoice and email 	he = for Hebrew
en = for English 	Optional 	he = for Hebrew doc (this is the default)
EZ.email_text 	Add additional text into the body of an email 	Text 	Optional 	
EZ.comment 	Add additional text into the body of a invoice document 	Text 	Optional 	
EZ.cc_emails 	An array of valid cc emails the invoice will be sent to 	Text 	Optional 	Limited to 10 emails
EZ.vat 	The invoice VAT if not supported the current VAT will be used 	Number only 	Optional 	Default = 0.18,
1 = 1.00,
0 = 0.00
EZ.description 	Add additional description into the body of a invoice document 	Text 	Optional 	Inserts text in the header of an invoice
EZ.customer_crn 	The customer company number/ID/ etc… (BN Number) 	Numbers only 	Optional 	Required by law when document value is greater than 5,000 ILS
EZ.create_org_as_foreign 	Default 0.
use when you have permission to create original documents in English or foreign currency. 	Boolean (0/1) 	Optional 	Israelis can’t create the original documents in English or not in ILS, so we create a copy and send a translated copy to the customer.
Step 3 - Soft - Returned parameters from credit card company
Parameter name 	Description 	Value format 	General
Id 	Transaction Id in Hypay 	Numbers only 	shown to the client in the payment confirmation
CCode 	Credit card company answer 	Number only 	Error between 0-200 is an error from Shva.
201-999 Hypay Error
see details on errors Article
Amount 	Amount actually charged 		
ACode 	confirmation code from credit card company 	Numbers only or letters 	if it's a tourist credit it would be a combination of the two
Fild1 	freetext field for the website owner 		
Fild2 	freetext field for the website owner 		
Fild3 	freetext field for the website owner 		
If MoreData was set to True this additional fields would show
Parameter name 	Description 	Value format 	General
Bank 	סולק 		Isracard = 1
Visa Cal = 2
Diners = 3
Amex = 4
Leumi Card = 6
TransType 	אופי העסקה 		Contactless
EMV Contactless
Mobile-CTL מגנטי
EMV Mobile-CTL
מספר טלפון נייד
EMV Contact
טלפונית
חתימה בלבד
אינטרנט-מאובטחת
fallback
PayWithMax
ApplePay
GooglePay
שירות עצמי
Payments 	Number of payments charged 		
UserId 	Clients ID 		
Brand 	Brand 		PL = 0
MasterCard = 1
Visa = 2
Diners = 3
Amex = 4
Isracard = 5
Issuer 	Credit card issuer 		Isracard = 1
Visa Cal = 2
JCB = 5
Leumi Card = 5
L4digit 	Credit card last 4 digits 		
street 	street 		
city 	city 		
zip 	zip 		
cell 	cell 		
Coin 			1 - ILS/שקל
2 - USD/דולר
3 - EURO/אירו
4 - POUND/פאונד
Tmonth 	Month credit card validity 		MM format
Tyear 	Year credit card validity 		YYYY format
Hesh 	Invoice number 		if invoice module is not active Hesh would get 0
UID 	UID unique value recieve from response after successful transaction
from request with action pay/soft 		Used for future purposes, for binding between steps of a transaction.
For example implementation a charge of the J5 transaction
spType 	Special card type 		00 – Default
01 – Immediate
70 – Club
03 – Petrol card
04 – Dual card
74 – Dual club
75 – Petrol club
06 – Chrageable
08 – Petrol
99 – Tourist card
bincard 	(BIN) refers to the first six numbers on a payment card 		
Soft - Special instructions
Special instructions for using this method:

    In no case the software should not save the credit card date, and especially not the cvv (you can save only the last 4 digits).

    Field CCode is returned always, if it dosn't , there is a problem with one of the three:

        Connecting the computer to the Internet.
        In the legality of the terminal number.
        In the parameter setting the work method.

    You must prsent the transaction number in Hypay to the user, this number will be used for inquiries against Hypay and not the credit card company's approval number.

    If the software is not certified for the PCI standard, it is possible to perform transactions in soft mode using a token or magnetic cards reader only.

Testing Credit Card

Number : 5326105300985614
ValidityDate : 12/25
CVV : 125
ID : real id number Or 890108566 Or 000000000

It is recommended to make the transaction with low amounts (5 NIS, 10 NIS, etc.)
If you want to simulate a failure use real credit card, who in testing terminal would get decline.
HK module
General - HK

    This module allows to create a client-to-customer billing agreement in one server call

    This module can only be used by the pay protocol

    You can make a standard transaction and also open a billing agreement

    Agreement data can not be updated by these api only by manual actions in the transaction management system. If there is such a demand, you should contact Token.

Stage 1 - relevent parameters for Pay protocol

<input type="hidden" name="HK" value="True">
<input type="hidden" name="Tash" value="24">
<input type="hidden" name="OnlyOnApprove" value="True">
<input type="hidden" name="FirstDate" value="yyyy-mm-dd">
<input type="hidden" name="freq" value="1">

Passed parameters
Parameter name 	Description 	Value format 	Requierd 	General
HK 	Pay Page in HK mode 	True / False
defualt set to False 	Optional 	Additional info in HK article
freq 	payment frequency 	Number in months 	Optional 	
FirstDate 	First payment date 	YYY-MM-DD 	Optional 	
Tash 	Number of payments 	Number of payments 	Requierd 	For HK without limit insert 999
OnlyOnApprove 	only if the first payment is approved the deal is closed 	True / False
defualt set to False 	Optional 	
HK Returned Parameters:

In addition to the standard parameters of the pay protocol An additional parameter named hkid = agreement number will be added

For Exmaple:

https://yaadpay.yaad.net?HKId=64238&Id=5334206&CCode=0&Amount=100&ACode=0012345&Order=12345678910&Fild1=Michael%20Isarel&Fild2=&Fild3=&Sign=8a30b17a53e7f6fe5c7f8268db1638ee010eae83bead8fa0ec1a9760407a3ac9&Bank=6&Payments=24&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&street=levanon%203&city=netanya&zip=42361&cell=0506400013&Coin=1&Tmonth=3&Tyear=2019&Hesh=1822

An example of an agreement in the management system
In the managment system you can:

    Update Amount and date of charge

    Stop/ Start charge

    Update credit card information

    update Update invoice details

In addition, it is possible to update a sweeping amount for all agreements by uploading an Excel file!
Make a transaction and creating HK in one call
Parameter name 	Description 	Value format 	Requierd 	General
Amount 	Monthly amount for charge 	Number 	Optional 	
HK 	Pay Page in HK mode 	True / False
defualt set to False 	Optional 	Additional info in HK article
freq 	payment frequency 	Number in months 	Optional 	
Tash 	Number of payments 	Number of payments
unlimited = 999 	Requierd 	For HK without limit insert 999
OnlyOnApprove 	only if the first payment is approved the deal is closed 	True / False
defualt set to False 	Optional 	
FirstDate 	First payment date 	YYY-MM-DD 	Optional 	
TashFirstPayment 	The amount of a single transaction 	Numbers only 	Optional 	
FirstPaymentTash 	The number of charges for the single transaction 	Numbers only 	Optional 	
Example of html request

<form action="https://pay.hyp.co.il/p/" method="post" target="_blank" accept-charset="UTF-8"
enctype="application/x-www-form-urlencoded" autocomplete="off" novalidate>

<input type="hidden" name="action" value="pay">
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="SendHesh" value="True">
<input type="hidden" name="HK" value="True">
<input type="hidden" name="OnlyOnApprove" value="True">
<input type="hidden" name="TashFirstPayment" value="50">
<input type="hidden" name="FixTash" value="True">
<input type="hidden" name="FirstPaymentTash" value="3">
<input type="hidden" name="Info" value="">

<input type="hidden" name="Amount" value="120">

<input type="hidden" name="sendemail" value="True">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">
<input type="hidden" name="UTF8out" value="True">
<input type="hidden" name="MoreData" value="True">
<input type="hidden" name="Coin" value="1">
<input type="hidden" name="Tash" value="999">
<input type="hidden" name="Masof" value="0010020610">

<input type="hidden" name="FirstDate" value="yyyy-mm-dd">
<!-- לשים לב לפומרט של התאריך -->



<input type="submit" value="שלח">
</form>

Example of payment page in this status
Termination / Activation of Agreement by api: (Change Status of Direct Debit Agreement)
HTTP request example

POST /p/ HTTP/1.1
Host: pay.hyp.co.il
Content-Length: 362
Content-Type: application/x-www-form-urlencoded

action=HKStatus&Masof=0010020610&HKId=64239&NewStat=1

Passed parameters
Field Name 	Description 	Value format
action 	Description of the request 	HKSatus
Masof 	Masof number in Hypay servers 	Numbers only
HKId 	Agreement number 	Numbers only
NewStat 	Termination = 1
Activation = 2 	
The response retunes in the format

HKId=xxxx&CCode=0

If CCode is 0 , the request was approved succesfuly, else it's an error

Common errors
CCode 	Information
905 	Wrong Parameter value
906 	Agreement dosn't exists
Postpone Transaction

Postpone_Transaction
General - Postpone Transaction

    This mechanism is for dividing the execution stage and the transaction implementation into two stages

    It can divide each deal and fit's to all credit cards unlike J5 deals (that are according to the clients credit card company).

    It is recommended to stores that wish to perform a transaction approval only after checking an order / inventory

    It is recommended to a place that have a high work load simultaneous and as a mechanism for handling communication failures / duplicate transactions

    This mechanism works in the pay & soft protocol

    The mechanism is not supported by Upay

Stage 1- Postpone - Adding the parameter to the relevent protocol
Postpone = True

Example for html request

<form action="https://pay.hyp.co.il/p/" method="POST" ><!-- URL Hypay -->
<!--Must-->
<input type="hidden" name="action" value="pay">
<input type="hidden" name="Masof" value="0010020610"> <!-- Masof TEST Terminal (10 digits)-->
<input type="hidden" name="Info"  value="תאור עסקה"> 
<input type="hidden" name="Amount"  value="100">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">
<input type="hidden" name="CC" value="4580121900146022">

<!-- for Pending transaction-->
<input type="hidden" name="Postpone" value="True">
<!--Optional for customer details-->
<input type="text" name="UserId" value="תעודת זהות">
<input type="text" name="ClientName" value="Michael">
<input type="text" name="ClientLName" value="Isarel">
<input type="text" name="street" value="levanon 3">
<input type="text" name="city" value="netanya">
<input type="text" name="zip" value="42361">
<input type="text" name="phone" value="098610338">
<input type="text" name="cell" value="0506400013">
<input type="text" name="email" value="avi@yaad.net">

<!--Optional for transaction-->
<input type="hidden" name="Order" value="12345678910">
<input type="hidden" name="FixTash" value="True">
<input type="hidden" name="Postpone" value="True">
<input type="hidden" name="Sign" value="True">
<input type="hidden" name="MoreData" value="True">
<input type="hidden" name="sendemail" value="True">
<input type="hidden" name="PageLang" value="">
<input type="hidden" name="Coin" value="1">


<input type="submit" value="pay">
</form>

Example for http request

POST /p/ HTTP/1.1
Host: pay.hyp.co.il
Content-Length: 317
Content-Type: application/x-www-form-urlencoded
Accept-Language: en-au

action=soft&Masof=0010020610&PassP=1234&Amount=100&Postpone=True&CC=4580121900146022&Tmonth=4&Tyear=2023&ClientName=israel&ClientLName=israel&UserId=203269535&street=levanon 3&city=netanya&zip=42361&cell=0505123123&phone=098610338&email=avi@yaad.net&MoreData=True&sendemail=True&Info=test&=&=&UTF8=True&UTF8out=True&=

Returned parameters

CCode = 800 is a valid postpone transaction else see details on errors Article

An Exmaple for a response

Response Code: OK
Transfer-Encoding: chunked
Content-Type: text/html
Date: Tue, 25 Jul 2017 09:03:40 GMT

Id=5343635&CCode=800&Amount=100&ACode=0012345&Fild1=&Fild2=&Fild3=&Bank=6&tashType=&Payments=1&TashFirstPayment=&UserId=203269535&Brand=2&Issuer=2&L4digit=0000&firstname=israel&lastname=israel&info=test&street=levanon%203&city=netanya&zip=42361&cell=0505123123&email=avi%40yaad.net&Coin=1&Tmonth=4&Tyear=2023

Presentation of the transaction in the management system
Stage 2 - Postpone - Commit the transaction

    It is recommended that the transaction be executed up to 72 hours after the billing request is made

    A transaction can be executed manually through the management system or via the API

Manual commit through the management system:

Enter the details of the transaction in the Billing Details tab and click on Transaction
Transaction commit by API

A reference address is https://pay.hyp.co.il/p/ A shortened address for all protocols in the system You can make a call in get or POST format Note the uppper and lowercase letters exactly as in the parameters table:
Field Name 	Value format
action 	commitTrans
Masof 	Masof number in Hypay servers
TransId 	Transaction Id for implementing
If the invoice model is active add these parameters 	
SendHesh 	True/False , defualt set to False
heshDesc 	Alphanumeric, defualt is deal Info
Pritim 	True/False , defualt set to False
Description for invoice contains items When using items, you must move a list of items in the heshDesc field according to the format specified in the appendix
sendHeshSMS 	The invoice send by SMS to cell parmter
http request example

POST /p/ HTTP/1.1
Host: pay.hyp.co.il
Content-Length: 370
Content-Type: application/x-www-form-urlencoded
Accept-Language: en-au

action=commitTrans&Masof=0010020610&TransId=5343635&SendHesh=True&heshDesc=תשלום עבור הזמנה 1234&UTF8=True&UTF8out=True

Returned parameters

Response Code: OK
Content-Type: text/html
Date: Tue, 25 Jul 2017 09:36:44 GMT

Id=5343923&CCode=0&Fild1=&Fild2=&Fild3=HeshASM=1132312124

CCode 	Information
0 	Deal commited
250 	Deal dosn't exists or already commited

HeshAsm is the number of Invoice that where created
Common errors
CCode 	Information
902 	Authentication error, unverified address in terminal
901 	Terminal is not allowed to work with this method please contact support

If you do not want to commit the transaction, you must leave the transaction at the status of 800
Cancel/ Refund Transaction
General - Cancel transaction

    A transaction can be canceled for every transaction until 23:20 on each day before a deposit is made to SHVA

    If a transaction is canceled, a transaction will not be presented to the credit card companies and there is no cancellation cost to the business

    A credit refund can be made at any stage even after 23:00 at night. Calling the credit card company to credit a transaction is like a new deal for all intents and purposes, so that the credit card company does not guarantee that if the transaction is carried out,

    If a credit refund is executed for the cardholder, a credit transaction will appear on the Credit Details page, followed by a credit transaction with a minus

    You can refund a different amount from the original transaction amount plus you can refund in payments

    If an invoice module is active both in a transaction cancellation mode and in a refund situation, a credit memo will be issued to the customer

Cancel Transaction threw managment system

A transaction can be canceled only on the day of the transaction until 23:30 without a credit or debit card from the credit card company !!

Click on the bottom of the page on the Billing Details tab, then click Cancel in the line of the relevant transaction

Can not restore a canceled transaction!

After the cancellation, the transaction will appear in the Billing Status tab with red status 998
Step 1 - Cancel Transaction threw API - Set up an authentication method

The authentication method is based on the console setting and can be one of the following:
Defined method 	Desctiption 	Remarks
Domain authentication 	This option is compatible for a user who want to pass deals from more than one webpage.
In this method the domain the call is made from is checked, in case the check returns false the request is denied 	More than one Domain can be defined
IP address authentication 	This option is compatible for a user who want to pass deals from only one webpage.
In this method the IP address the call is made from is checked, in case the check returns false the request is denied 	More than one IP can be defined
Password authentication (PassP) 	Allows you to access the page by a visible password without the need for authentication 	Suitable for a link that is redirected to the system from an unlimited number of addresses
Step 2 - Cancel Transaction threw API - Request for transaction cancellation

In order to cancel a transaction we will need the transaction number which returns in the Id parameter returnes when commiting the transaction. A reference address is https://pay.hyp.co.il/p/ A shortened address for all protocols in the system You can make a call in get or POST format Note the uppper and lowercase letters exactly as in the parameters table:
Field name 	Value format
action 	CancelTrans
Masof 	Masof number in Hypay servers
TransId 	Transaction number
An Example for POST request

<form action="https://pay.hyp.co.il/p/" method="post" >

<input type="hidden" name="action" value="CancelTrans">
<input type="hidden" name="Masof" value="0010020610"> 
<input type="hidden" name="TransId" value="5890796">


<input type="submit" value="CancelTrans">
</form>

Step 3 - Cancel Transaction threw API - Returned parameters
Field name 	Value format
TransId 	Transaction number
CCode 	Credit card company answer
Hesh 	Invoice number
CCode 	Information
0 	Valid request
920 	Deal dosn't exists or already commited
Refund Transaction - By Transaction Number

You can refund a transaction using the orginal transaction's Id. In order to cancel a transaction we will need the transaction number which returns in the Id parameter returnes when commiting the transaction. You can make a call in a GET or POST format.

    The maximum amount can't be greater than the original transaction's amount.

    The action does NOT replace the secret refund password.

    Transaction token is NOT required.

    Note the uppper and lowercase letters exactly as in the parameters table:

Parameter name 	Description 	Value format 	Requierd
action 		zikoyAPI 	Requierd
Masof 	Masof number in Hypay servers 	1234567890 	Requierd
TransId 	Transaction number 	12345678 	Requierd
Amount 	Refund amount 	10 	Requierd
PassP 	Authentication with password 	Value from client service 	Requierd if this your chosen authentication method
UTF8 	The data is encoded in utf-8 	True / False - default set to False 	Optional
UTF8out 	Return answer in utf-8 encoding 	True / False - default set to False 	Optional
Tash 	Amount of payments 	12 	Optional
SendHesh 	send invoice in email 	True / False - default set to False 	Optional
HTTP request example

POST /p/ HTTP/1.1
Host: pay.hyp.co.il
Content-Length: 370
Content-Type: application/x-www-form-urlencoded
Accept-Language: en-au

action=zikoyAPI&Masof=0010072619&PassP=1234&UTF8=True&UTF8out=True&Tash=1&TransId=12290620&SendHesh=True&Amount=10

Returned parameters

Response Code: OK
Content-Type: text/html
Date: Tue, 25 Jul 2017 09:36:44 GMT

Id=17765278&CCode=0&ACode=0012345&HeshASM=1235095

Returned parameters
Parameter name 	Description 	Value format 	General
Id 	Transaction Id of the new refund transaction in Hypay 	Numbers only 	shown to the client in the payment confirmation
CCode 	Credit card company answer 	Number only 	See details on errors Article
ACode 	confirmation code from credit card company 	Numbers only or letters 	if it's a tourist credit it would be a combination of the two
CCode 	Information
0 	Valid request
33 	Refund amount is greater than the original transaction's amount.
Any other code 	Refer to Error codes list
Refund Transaction - PAYout

    The refund threw API is executed by a soft protocol

    zPass = The only difference between performing a billing transaction and refund transaction is not adding a parameter

    zPass = [PASSWORD] = A secret credit password that is sent to the terminal owner's cell phone number

    Password is not interchangeable

    The amount of the transaction must be transferred in a similar manner to the charge of a regular transaction with a plus rather than a minus

    You can win by Token and simply add the same parameter as a billing transaction

An example for refund request

<form action="https://pay.hyp.co.il/p/" method="post" >

<input type="hidden" name="action" value="soft">
<input type="hidden" name="Masof" value="0010020610"> 
<input type="hidden" name="PassP" value="2345">
<input type="hidden" name="UserId" value="000000000">
<input type="hidden" name="ClientName" value="Michael Israel">
<input type="hidden" name="Info" value="demo">
<input type="hidden" name="Amount"  value="2">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">
<input type="hidden" name="CC" value="6907500685494032346">
<input type="hidden" name="Tmonth" value="04">
<input type="hidden" name="Tyear" value="2023">
<input type="hidden" name="heshDesc" value="
[0~99~1~demo]">
<input type="hidden" name="Token" value="True">
<input type="hidden" name="zPass" value="1234">
<input type="hidden" name="Order" value="23455678910">
<input type="hidden" name="street" value="levanon 3">
<input type="hidden" name="city" value="netanya">
<input type="hidden" name="zip" value="42361">
<input type="hidden" name="phone" value="098610338">
<input type="hidden" name="cell" value="0506400013">
<input type="hidden" name="email" value="avi@yaad.net">
<input type="hidden" name="SendHesh" value="True">
<input type="hidden" name="cvv" value="128">

<input type="hidden" name="sendemail" value="True">

<input type="submit" value="zikoy">
</form>

An example for a response

Id=5920751&CCode=0&Amount=2&ACode=0034903&Fild1=&Fild2=&Fild3=&Hesh=47

EzCount Invoice module
General - EzCount Invoice module

The EzCount Invoicing module is connected to the payment system directly so that when each transaction is dealt with, an invoice is issued Automatically. Transferring the parameters affects only the data that will be displayed on the invoice.
EzCount Invoice related params
Parameter name 	Description 	Value format 	Requierd 	General
SendHesh 	send invoice in email 	True / False
defualt set to False 	Optional 	invoice would be sent to the mail in email parameter
heshDesc 	Different desctiption to the invoice 	Text/ Number or items values 	Optional 	Requierd if Pritim equals True
Pritim 	The invoice description contains items 	True / False
defualt set to False 	Optional 	see article on Invoices
blockItemValidation 	Force strict validation of item totals 	True / False
default set to False 	Optional 	When set to True, if the sum of items in heshDesc does not match the total transaction amount, the transaction will be blocked with CCode=400
EZ.lang 	Language of invoice and email 	he = for Hebrew
en = for English 	Optional 	he = for Hebrew doc (this is the default)
EZ.email_text 	Add additional text into the body of an email 	Text 	Optional 	
EZ.comment 	Add additional text into the body of a invoice document 	Text 	Optional 	
EZ.cc_emails 	An array of valid cc emails the invoice will be sent to 	Text 	Optional 	Limited to 10 emails
EZ.vat 	The invoice VAT if not supported the current VAT will be used 	Number only 	Optional 	Default = 0.18,
1 = 1.00,
0 = 0.00
EZ.description 	Add additional description into the body of a invoice document 	Text 	Optional 	Inserts text in the header of an invoice
EZ.customer_crn 	The customer company number/ID/ etc… (BN Number) 	Numbers only 	Optional 	Required by law when document value is greater than 5,000 ILS
EZ.create_org_as_foreign 	Default 0.
use when you have permission to create original documents in English or foreign currency. 	Boolean (0/1) 	Optional 	Israelis can’t create the original documents in English or not in ILS, so we create a copy and send a translated copy to the customer.
Transfering Items to the Invoice

To transfer items to the invoice, follow these steps:
1. Enable Item Transfer

Pass the parameter Pritim=True in the request so the system acknowledges the transfer of items.
2. Define Item Details

The details of the items should be included in the heshDesc parameter. The format for describing items is as follows:

    Each item must be enclosed in brackets [].

    No digits are allowed between items.

    Each item should include the following parameters, separated by a tilde (~), and listed in this specific order:
        Item Code for Bookkeeping: If unavailable, pass 0 instead.
        Description of the Item.
        Quantity (Amount) of the Item.
        Price per Item (including VAT).

3. Validation

If the total cost of all items (calculated as quantity × price per item) does not match the Amount parameter sent in the transaction, the system will return error code 16.
Example of Items String

[0~Item 1~1~8][0~Item 2~2~1]

    Item 1:
        Code: 0 (no bookkeeping code).
        Description: Item 1.
        Quantity: 1.
        Price: 8 coins.

    Item 2:
        Code: 0 (no bookkeeping code).
        Description: Item 2.
        Quantity: 2.
        Price: 1 coin per item.

Total charge:

    Item 1: 1 × 8 = 8 coins.

    Item 2: 2 × 1 = 2 coins.

    Grand Total: 10 coins.

By following this structure, you ensure the items are transferred correctly to the invoice and avoid validation errors.
Creation link to EzCount Invoice with API call
Step 1 - EzCount Invoice APISign request

At this step, you collect all the necessary input for the transaction:

action=PrintHesh,
TransId=Id,
type=EZCOUNT,
..


In addition, add the following parameters to create a request:

    action=APISign

    What=SIGN

    MASOF

    KEY

    PassP

Example of a GET Request:

https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl?Masof=0010210290&action=APISign&KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220&What=SIGN&PassP=6789&TransId=55373520&type=EZCOUNT&ACTION=PrintHesh

Note:

ACTION=PrintHesh is sent in capital letters.
action=APISign is sent in lowercase letters, as shown in the example.

Example of the Response:

Masof=0010210290&TransId=55373520&action=PrintHesh&type=EZCOUNT&signature=ae0aab7176a3e8a6edc0541d1c399a6b6c51b512bf93acdcf5559025ed9a6c9a

Notice that we received a signature parameter in the return value. This signature will be used in the next step.
Step 2 - add url host

To create the final link, append the result from Step 1 to the following host:

https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl + ? + result =

The final link will look like this:

https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl?Masof=0010210290&TransId=55373520&action=PrintHesh&type=EZCOUNT&signature=ae0aab7176a3e8a6edc0541d1c399a6b6c51b512bf93acdcf5559025ed9a6c9a

Click HERE TO TEST THE LINK
Printing Invoice with API call

To print an invoice not from the management interface, use the following address:
https://pay.hyp.co.il/p/
With the following parameters. Note the upper and lowercase letters exactly as in the parameters table:
Field Name 	Value/Description
action 	PrintHesh
Masof 	Masof number in YaadPay servers
TransId 	Transaction id of the wanted invoice.
If passed, asm is not required.
asm 	Invoice id for printing
type 	Determines the invoice type to print:
- HTML: Returns the invoice in an HTML format (used for old system invoices).
- PDF: Returns a digitally signed PDF file. Note that generation may take up to 20 minutes from the transaction time (used for old system invoices).
- EZCOUNT: Generates an invoice using the new EZCount system (for accounts configured with the new system).
- NEW: Prints all invoices that haven't been printed yet, in HTML format.
HeshORCopy 	True - Prints an authentic copy ("נאמן למקור").
False - Prints a copy ("העתק").
Notes:

    For accounts still using the old system, use HTML or PDF in the type parameter to print invoices from the old system.

    For accounts configured with the new EZCount system, use EZCOUNT in the type parameter.

    Ensure the Masof and TransId or asm parameters are properly filled to retrieve the correct invoice.

Create invoice for offline transactions
Cash

<form action="https://pay.hyp.co.il/p/" method="get" >

<input type="hidden" name="action" value="soft">
<input type="hidden" name="Masof" value="0010072619"> 
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">

<input type="hidden" name="TransType" value="Cash">
<input type="hidden" name="Info" value="תאור עסקה">
<input type="hidden" name="Amount"  value="200">

<input type="hidden" name="Pritim" value="True">
<input type="hidden" name="heshDesc" value="[001~demo1~2~50][002~demo2~1~100]">
<input type="hidden" name="SendHesh" value="True">

<input type="hidden" name="UserId" value="203269535">
<input type="hidden" name="ClientName" value="שם פרטי">
<input type="hidden" name="ClienLtName" value="שם משפחה">
<input type="hidden" name="street" value="רחוב">
<input type="hidden" name="city" value="עיר">
<input type="hidden" name="zip" value="מיקוד">
<input type="hidden" name="phone" value="טלפון">
<input type="hidden" name="cell" value="פלאפון">
<input type="hidden" name="email" value="demo@demo.co.il">

<input type="submit" value="Cash">
</form>

Check

<form action="https://pay.hyp.co.il/p/" method="get" >

<input type="hidden" name="action" value="soft">
<input type="hidden" name="Masof" value="0010072619"> 
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">

<input type="hidden" name="TransType" value="Check">
<input type="hidden" name="Info" value="תאור עסקה">
<input type="hidden" name="Amount"  value="200">
<input type="hidden" name="Bank" value="10">
<input type="hidden" name="Snif" value="912">
<input type="hidden" name="PAN" value="1234456">
<input type="hidden" name="CheckNum" value="11111111">
<input type="hidden" name="Date" value="20180211">

<input type="hidden" name="Pritim" value="True">
<input type="hidden" name="heshDesc" value="[001~demo1~2~50][002~demo2~1~100]">
<input type="hidden" name="SendHesh" value="True">

<input type="hidden" name="UserId" value="203269535">
<input type="hidden" name="ClientName" value="שם פרטי">
<input type="hidden" name="ClienLtName" value="שם משפחה">
<input type="hidden" name="street" value="רחוב">
<input type="hidden" name="city" value="עיר">
<input type="hidden" name="zip" value="מיקוד">
<input type="hidden" name="phone" value="טלפון">
<input type="hidden" name="cell" value="פלאפון">
<input type="hidden" name="email" value="demo@demo.co.il">


<input type="submit" value="Check">
</form>

Multi

<form action="https://pay.hyp.co.il/p/" method="get" >

<input type="hidden" name="action" value="soft">
<input type="hidden" name="Masof" value="0010072619"> 
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">

<input type="hidden" name="TransType" value="Multi">
<input type="hidden" name="Info" value="תאור עסקה">
<input type="hidden" name="Amount"  value="100,50,50">
<input type="hidden" name="Bank" value="10,12,11">
<input type="hidden" name="Snif" value="912,826,921">
<input type="hidden" name="PAN" value="1234456,1111111,222222">
<input type="hidden" name="CheckNum" value="11111111,112223,3554568">
<input type="hidden" name="Date" value="20180211,20180911,20181012">

<input type="hidden" name="Pritim" value="True">
<input type="hidden" name="heshDesc" value="[001~demo1~2~50][002~demo2~1~100]">
<input type="hidden" name="SendHesh" value="True">

<input type="hidden" name="UserId" value="203269535">
<input type="hidden" name="ClientName" value="שם פרטי">
<input type="hidden" name="ClienLtName" value="שם משפחה">
<input type="hidden" name="street" value="רחוב">
<input type="hidden" name="city" value="עיר">
<input type="hidden" name="zip" value="מיקוד">
<input type="hidden" name="phone" value="טלפון">
<input type="hidden" name="cell" value="פלאפון">
<input type="hidden" name="email" value="demo@demo.co.il">

<input type="submit" value="Multi">
</form>

Multi With Cash

<form action="https://pay.hyp.co.il/p/" method="get" >

<input type="hidden" name="action" value="soft">
<input type="hidden" name="Masof" value="0010072619"> 
<input type="hidden" name="PassP" value="1234">
<input type="hidden" name="UTF8" value="True">
<input type="hidden" name="UTF8out" value="True">

<input type="hidden" name="TransType" value="Multi">
<input type="hidden" name="Info" value="תאור עסקה">
<input type="hidden" name="Amount"  value="100,50,50">
<input type="hidden" name="Bank" value="10, ,11">
<input type="hidden" name="Snif" value="912, ,921">
<input type="hidden" name="PAN" value="1234456, ,222222">
<input type="hidden" name="CheckNum" value="11111111, ,3554568">
<input type="hidden" name="Date" value="20180211, ,20181012">

<input type="hidden" name="Pritim" value="True">
<input type="hidden" name="heshDesc" value="[001~demo1~2~50][002~demo2~1~100]">
<input type="hidden" name="SendHesh" value="True">
<input type="hidden" name="UserId" value="203269535">
<input type="hidden" name="ClientName" value="שם פרטי">
<input type="hidden" name="ClienLtName" value="שם משפחה">
<input type="hidden" name="street" value="רחוב">
<input type="hidden" name="city" value="עיר">
<input type="hidden" name="zip" value="מיקוד">
<input type="hidden" name="phone" value="טלפון">
<input type="hidden" name="cell" value="פלאפון">
<input type="hidden" name="email" value="demo@demo.co.il">

<input type="submit" value="Multi-whit-Cash">
</form>

Testing Credit Card

Number : 5326105300985614
ValidityDate : 12/25
CVV : 125
ID : real id number Or 890108566 Or 000000000

It is recommended to make the transaction with low amounts (5 NIS, 10 NIS, etc.)
If you want to simulate a failure use real credit card, who in testing terminal would get decline.





Error Codes

The error codes are divided to two: Shva error are from 0-200, Hypay Server error are 201-999
Hypay Error codes
Code 	Meaning 	Remarks
901 	Terminal is not permitted to work in this method 	No permission
902 	Authentication error 	A reference to the terminal differs from the authentication method defined
903 	The number of payments configured in the terminal has been exceeded 	For change please contact support
999 	Comunication error - Hypay 	
998 	Deal canclled- Hypay 	
997 	Token is not valid 	
996 	Terminal is not permitted to use token 	
800 	Postpone charge 	
700 	Approve without charge 	Reserve a credit line without a deposit in J5
600 	Receiving transaction details (J2) 	Check card information - Check the integrity of the card number without checking the J2 frame
990 	Card details are not fully readable, please pass the card again 	
400 	Sum of Items differ from transaction amount 	Parameter Amount and amount of items are not equal (Invoice module)
401 	It is requierd to enter first or last name 	you must send ClientName or ClientLName param
402 	It is requierd to enter deal information 	you must send Info params
33 	You can credit the entire transaction or a small amount of the transaction amount only 	
Hypay Error codes - Hebrew
קוד 	ערך 	הערות
901 	מסוף לא מורשה לעבודה בשיטה זו 	אין הרשאה למסוף
902 	שגיאת אימות 	הפניה למסוף שונה משיטת האימות המוגדרת
903 	חריגה ממספר התשלומים שמוגדר במסוף 	יש לפנות לתמיכה לצורך שינוי
999 	שגיאת תקשורת - יעד סליקה 	
998 	עסקה בוטלה - יעד סליקה 	
997 	טוקן לא תקין 	
996 	מסוף לא מורשה לשימוש בטוקן 	
800 	חיוב דחוי 	
700 	אישור ללא חיוב 	j5 שיריון מסגרת ללא הפקדה
600 	קבלת פרטי עסקה (J2) 	בדיקת פרטי כרטיס -בדיקת תקינות מספר הכרטיס ללא בדיקת מסגרת J2
990 	פרטי הכרטיס לא נקראו בצורה מלאה, נא להעביר את הכרטיס שנית 	
400 	סכום הפריטים אינו תואם לסכום לחיוב 	פרמטר סכום וסכימה של הפרטים אינם שויים (מודול חשבוניות)
401 	חובה להזין שם פרטי או משפחה 	יש לשלוח פרמטר ClientName or ClientLName
402 	חובה להזין תיאור עסקה 	יש לשלוח פרמטר Info
33 	ניתן לזכות את כל העסקה או סכום קטן מסכום העסקה בלבד 	
Shva Error codes - Ashrayit EMV - Hebrew
קוד שגיאה 	תיאור
000 	מאושר
001 	כרטיס חסום
002 	גנוב החרם כרטיס
003 	התקשר לחברת האשראי
004 	העסקה לא אושרה
005 	כרטיס מזוייף החרם
006 	דחה עסקה: cvv2 שגוי
007 	דחה עסקה: cavv/ucaf שגוי
008 	דחה עסקה: avs שגוי
009 	דחייה - נתק בתקשורת
010 	אישור חלקי
011 	דחה עסקה: חוסר בנקודות/כוכבים/מיילים/הטבה אחרת
012 	בכרטיס לא מורשה במסוף
013 	דחה בקשה .קוד יתרה שגוי
014 	דחייה .כרטיס לא משוייך לרשת
015 	דחה עסקה: הכרטיס אינו בתוקף
016 	דחייה -אין הרשאה לסוג מטבע
017 	דחייה -אין הרשאה לסוג אשראי בעסקה
026 	דחה עסקה - id שגוי
041 	ישנה חובת יציאה לשאילתא בגין תקרה בלבד לעסקה עם פרמטר j2
042 	ישנה חובת יציאה לשאילתא לא רק בגין תקרה, לעסקה עם פרמטר j2
051 	חסר קובץ ווקטור 1
052 	חסר קובץ ווקטור 4
053 	חסר קובץ ווקטור 6
055 	חסר קובץ ווקטור 11
056 	חסר קובץ ווקטור 12
057 	חסר קובץ ווקטור 15
058 	חסר קובץ ווקטור 18
059 	חסר קובץ ווקטור 31
060 	חסר קובץ ווקטור 34
061 	חסר קובץ ווקטור 41
062 	חסר קובץ ווקטור 44
063 	חסר קובץ ווקטור 64
064 	חסר קובץ ווקטור 80
065 	חסר קובץ ווקטור 81
066 	חסר קובץ ווקטור 82
067 	חסר קובץ ווקטור 83
068 	חסר קובץ ווקטור 90
069 	חסר קובץ ווקטור 91
070 	חסר קובץ ווקטור 92
071 	חסר קובץ ווקטור 93
073 	חסר קובץ PARAM_3_1
074 	חסר קובץ PARAM_3_2
075 	חסר קובץ PARAM_3_3
076 	חסר קובץ PARAM_3_4
077 	חסר קובץ PARAM_361
078 	חסר קובץ PARAM_363
079 	חסר קובץ PARAM_364
080 	חסר קובץ PARAM_61
081 	חסר קובץ PARAM_62
082 	חסר קובץ PARAM_63
083 	חסר קובץ CEIL_41
084 	חסר קובץ CEIL_42
085 	חסר קובץ CEIL_43
086 	חסר קובץ CEIL_44
087 	חסר קובץ DATA
088 	חסר קובץ JENR
089 	חסר קובץ Start
101 	חסרה כניסה בוקטור 1
103 	חסרה כניסה בוקטור 4
104 	חסרה כניסה בוקטור 6
106 	חסרה כניסה בוקטור 11
107 	חסרה כניסה בוקטור 12
108 	חסרה כניסה בוקטור 15
110 	חסרה כניסה בוקטור 18
111 	חסרה כניסה בוקטור 31
112 	חסרה כניסה בוקטור 34
113 	חסרה כניסה בוקטור 41
114 	חסרה כניסה בוקטור 44
116 	חסרה כניסה בוקטור 64
117 	חסרה כניסה בוקטור 81
118 	חסרה כניסה בוקטור 82
119 	חסרה כניסה בוקטור 83
120 	חסרה כניסה בוקטור 90
121 	חסרה כניסה בוקטור 91
122 	חסרה כניסה בוקטור 92
123 	חסרה כניסה בוקטור 93
141 	חסרה כניסה מתאימה בקובץ פרמטרים 3.2
142 	חסרה כניסה מתאימה בקובץ פרמטרים 3.3
143 	חסרה כניסה בקובץ תחומי מועדון 3.6.1
144 	חסרה כניסה בקובץ תחומי מועדון 3.6.3
145 	חסרה כניסה בקובץ תחומי מועדון 3.6.4
146 	חסרה כניסה בקובץ תקרות לכרטיסי 4.1 PL
147 	חסרה כניסה בקובץ תקרות לכרטיסים ישראלים שאינם PLשיטה 4.2 0
148 	חסרה כניסה בקובץ תקרות לכרטיסים ישראלים שאינם PLשיטה 4.3 1
149 	חסרה כניסה בקובץ תקרות לכרטיסי תייר 4.4
150 	חסרה כניסה בקובץ כרטיסים תקפים -ישראכרט
151 	חסרה כניסה בקובץ כרטיסים תקפים -כאל
152 	חסרה כניסה בקובץ כרטיסים תקפים -מנפיק עתידי
182 	שגיאה בערכי וקטור 4
183 	שגיאה בערכי וקטור 6/12
186 	שגיאה בערכי וקטור 18
187 	שגיאה בערכי וקטור 34
188 	שגיאה בערכי וקטור 64
190 	שגיאה בערכי וקטור 90
191 	נתונים לא תקינים בוקטור הרשאות מנפיק
192 	נתונים לא ולידים בסט הפרמטרים
193 	נתונים לא ולידים בקובץ פרמטרים ברמת מסוף
300 	אין הרשאה לסוג עסקה - הרשאת סולק
301 	אין הרשאה למטבע - הרשאת סולק
303 	אין הרשאת סולק לביצוע עסקה כאשר הכרטיס לא נוכח
304 	אין הרשאה לאשראי - הרשאת סולק
308 	אין הרשאה להצמדה - הרשאת סולק
309 	אין הרשאת סולק לאשראי במועד קבוע
310 	אין הרשאה להקלדת מספר אישור מראש
311 	אין הרשאה לבצע עסקאות לקוד שרות 587
312 	אין הרשאת סולק לאשראי דחוי
313 	אין הרשאת סולק להטבות
314 	אין הרשאת סולק למבצעים
315 	אין הרשאת סולק לקוד מבצע ספציפי
316 	אין הרשאת סולק לעסקת טעינה
317 	אין הרשאת סולק לטעינה/פריקה בקוד אמצעי התשלום בשילוב קוד מטבע
318 	אין הרשאת סולק למטבע בסוג אשראי זה
319 	אין הרשאת סולק לטיפ
322 	אין הרשאה מתאימה לביצוע בקשה לאישור ללא עסקה J5
341 	אין הרשאה לעסקה - הרשאת מנפיק
342 	אין הרשאה למטבע - הרשאת מנפיק
343 	אין הרשאת מנפיק לביצוע עסקה כאשר הכרטיס לא נוכח
344 	אין הרשאה לאשראי - הרשאת מנפיק
348 	אין הרשאה לביצוע אישור בקשה יזומה ע"י קמעונאי
349 	אין הרשאה מתאימה לביצוע בקשה לאישור ללא עסקה J5
350 	אין הרשאת מנפיק להטבות
351 	אין הרשאת מנפיק לאשראי דחוי
352 	אין הרשאת מנפיק לעסקת טעינה
353 	אין הרשאת מנפיק לטעינה/פריקה בקוד אמצעי התשלום
354 	אין הרשאת מנפיק למטבע בסוג אשראי זה
381 	אין הרשאה לבצע עסקת contactlessמעל סכום מרבי
382 	במסוף המוגדר כשרות עצמי ניתן לבצע רק עסקאות בשירות עצמי
384 	מסוף מוגדר כרב-ספק /מוטב - חסר מספר ספק/מוטב
385 	במסוף המוגדר כמסוף סחר אלקטרוני חובה להעביר eci
401 	מספר התשלומים גדול מערך שדה מספר תשלומים מקסימלי
402 	מספר התשלומים קטן מערך שדה מספר תשלומים מינימלי
403 	סכום העסקה קטן מערך שדה סכום מינמלי לתשלום !!!
404 	לא הוזן שדה מספר תשלומים
405 	חסר נתון סכום תשלום ראשון /קבוע
406 	סה"כ סכום העסקה שונה מסכום תשלום ראשון +סכום תשלום קבוע *מספר תשלומים
408 	ערוץ 2 קצר מ-37 תווים
410 	דחיה מסיבת dcode
414 	בעסקה עם חיוב בתאריך קבוע הוכנס תאריך מאוחר משנה מבצוע העיסקה
415 	הוזנו נתונים לא תקינים
416 	תאריך תוקף לא במבנה תקין
417 	מספר מסוף אינו תקין
418 	חסרים פרמטרים חיוניים (להודעת שגיאה זו מתווספת רשימת הפרמטרים החסרים)
419 	שגיאה בהעברת מאפיין clientInputPan
420 	מספר כרטיס לא ולידי -במצב של הזנת ערוץ 2בעסקה ללא כרטיס נוכח
421 	שגיאה כללי -נתונים לא ולידים
422 	שגיאה בבנית מסר ISO
424 	שדה לא נומרי
425 	רשומה כפולה
426 	הסכום הוגדל לאחר ביצוע בדיקות אשראית
428 	חסר קוד שרות בכרטיס
429 	כרטיס אינו תקף לפי קובץ כרטיסים תקפים
431 	שגיאה כללית
432 	אין הראשה להעברת כרטיס דרך קורא מגנטי
433 	חיוב להעביר ב - PinPad
434 	אסור להעביר כרטיס במכשיר ה- PinPad
435 	המכשיר לא מוגדר להעברת כרטיס מגנטי CTL
436 	המכשיר לא מוגדר להעברת כרטיס EMV CTL
439 	אין הרשאה לסוג אשראי לפי סוג עסקה
440 	כרטיס תייר אינו מורשה לסוג אשראי זה
441 	אין הרשאה לביצוע סוג עסקה - כרטיס קיים בוקטור 80
442 	אין לבצע Stand-inלאימות אישור לסולק זה
443 	לא ניתן לבצע עסקת ביטול - כרטיס לא נמצא בקובץ תנועות הקיים במסוף
445 	בכרטיס חיוב מיידי ניתן לבצע אשראי חיוב מיידי בלבד
447 	מספר כרטיס שגוי
448 	חיוב להקליד כתובת לקוח (מיקוד ,מספר בית ועיר)
449 	חיוב להקליד מיקוד
450 	קוד מבצע מחוץ לתחום, צ"ל בתחום 1-12
451 	שגיאה במהלך בנית רשומת עסקה
452 	בעסקת טעינה/פריקה/בירור יתרה חיוב להזין שדה קוד אמצעי תשלום
453 	אין אפשרות לבטל עסקת פריקה 7.9.3
455 	לא ניתן לבצע עסקת חיוב מאולצת כאשר נדרשת בקשה לאישור (למעט תקרות)
456 	כרטיס נמצא בקובץ תנועות עם קוד תשובה 'החרם כרטיס'
457 	בכרטיס חיוב מיידי מותרת עסקת חיוב רגילה/זיכוי/ביטול
458 	קוד מועדון לא בתחום
470 	בעסקת הו"ק סכום התשלומים גבוה משדה סכום העסקה
471 	בעסקת הו"ק מספר תשלום תורן גדול מסה"כ מספר התשלומים
472 	בעסקת חיוב עם מזומן חיוב להזין סכום במזומן
473 	בעסקת חיוב עם מזומן סכום המזומן צריך להיות קטן מסכום העסקה
474 	עסקת איתחול בהוראת קבע מחייבת פרמטר J5
475 	עסקת ה"ק מחייבת אחד מהשדות: מספר תשלומים או סכום כולל
476 	עסקת תורן בהוראת קבע מחייבת שדה מספר תשלום
477 	עסקת תורן בהוראת קבע מחייבת מספר מזהה של עסקת איתחול
478 	עסקת תורן בהוראת קבע מחייבת מספר אישור של עסקת איתחול
479 	עסקת תורן בהוראת קבע מחייבת שדות תאריך וזמן עסקת איתחול
480 	חסר שדה מאשר עסקת מקור
481 	חסר שדה מספר יחידות כאשר העסקה מתבצעת בקוד אמצעי תשלום השונה ממטבע
482 	בכרטיס נטען מותרת עסקת חיוב רגילה/זיכוי/ביטול/פריקה/טעינה/בירור יתרה
483 	עסקה עם כרטיס דלק במסוף דלק חיוב להזין מספר רכב
484 	מספר רכב המוקלד שונה ממספר הרכב הצרוב ע"ג הפס המגנטי/מספר בנק שונה מ-012/ספרות שמאליות של מספר הסניף שונה מ-44
485 	מספר רכב קצר מ- 6ספרות /שונה ממספר הרכב המופיע ע"ג ערוץ 2 (פוזיציה 34 בערוץ 2) כרטיס מאפיין דלק של לאומי קארד
486 	ישנה חובת הקלדת קריאת מונה (פוזיציה 30בערוץ )2כרטיס מאפיין דלק של לאומי קארד
487 	רק במסוף המוגדר כדלק דו שלבי ניתן להשתמש בעדכון אובליגו
489 	בכרטיס דלקן מותרת עסקת חיוב רגילה בלבד (עסקת ביטול אסורה)
490 	בכרטיסי דלק/דלקן/דלק מועדון ניתן לבצע עסקאות רק במסופי דלק
491 	עסקה הכוללת המרה חייבת להכיל את כל השדות conversion_rate_06, conversion_rate_09, conversion_currency_51
492 	אין המרה על עסקאות שקל/דולר
493 	בעסקה הכוללת הטבה חיוב שיהיו רק אחד מהשדות הבאים: סכום הנחה/מספר יחידות/% ההנחה
494 	מספר מסוף שונה
495 	אין הרשאת fallback
496 	לא ניתן להצמיד אשראי השונה מאשראי קרדיט/תשלומים
497 	לא ניתן להצמיד לדולר/מדד במטבע השונה משקל
498 	כרטיס ישראכרט מקומי הספרטור צ"ל בפוזיציה 18
500 	העסקה הופסקה ע"י המשתמש
504 	חוסר התאמה בין שדה מקור נתוני הכרטיס לשדה מספר כרטיס
505 	ערך לא חוקי בשדה סוג עסקה
506 	ערך לא חוקי בשדה eci
507 	סכום העסקה בפועל גבוה מהסכום המאושר
509 	שגיאה במהלך כתיבה לקובץ תנועות
512 	לא ניתן להכניס אישור שהתקבל ממענה קולי לעסקה זו
551 	מסר תשובה אינו מתאים למסר הבקשה
552 	שגיאה בשדה 55
553 	התקבלה שגיאה מהטנדם
554 	במסר התשובה חסר שדה mcc_18
555 	במסר התשובה חסר שדה response_code_25
556 	במסר התשובה חסר שדה rrn_37
557 	במסר התשובה חסר שדה comp_retailer_num_42
558 	במסר התשובה חסר שדה auth_code_43
559 	במסר התשובה חסר שדה f39_response_39
560 	במסר התשובה חסר שדה authorization_no_38
561 	במסר התשובה חסר/ריק שדה additional_data_48.solek_auth_no
562 	במסר התשובה חסר אחד מהשדות conversion_amount_06, conversion_rate_09, conversion_currency_51
563 	ערך השדה אינו מתאים למספרי האישור שהתקבלו auth_code_43
564 	במסר התשובה חסר/ריק שדה additional_amunts54.cashback_amount
565 	אי-התאמה בין שדה 25לשדה 43
566 	במסוף המוגדר כתומך בדלק דו-שלבי יש חובה להחזיר שדות 90,119
567 	שדות 25,127לא תקינים במסר עידכון אובליגו במסוף המוגדר כדלק דו-שלבי
598 	ERROR_IN_NEG_FILE
599 	שגיאה כללית
700 	עסקה נדחתה ע"י מכשיר PinPad
701 	שגיאה במכשיר pinpad
702 	יציאת com לא תקינה
703 	PINPAD_TransactionError
704 	PINPAD_TransactionCancelled
705 	PINPAD_UserCancelled
706 	PINPAD_UserTimeout
707 	PINPAD_UserCardRemoved
708 	PINPAD_UserRetriesExceeded
709 	PINPAD_PINPadTimeout
710 	PINPAD_PINPadCommsError
711 	PINPAD_PINPadMessageError
712 	PINPAD_PINPadNotInitialized
713 	PINPAD_PINPadCardReadError
714 	PINPAD_ReaderTimeout
715 	PINPAD_ReaderCommsError
716 	PINPAD_ReaderMessageError
717 	PINPAD_HostMessageError
718 	PINPAD_HostConfigError
719 	PINPAD_HostKeyError
720 	PINPAD_HostConnectError
721 	PINPAD_HostTransmitError
722 	PINPAD_HostReceiveError
723 	PINPAD_HostTimeout
724 	PINVerificationNotSupportedByCard
725 	PINVerificationFailed
726 	שגיאה בקליטת קובץ config.xml
730 	מכשיר אישר עסקה בניגוד להחלטת אשראית
731 	כרטיס לא הוכנס
777 	תקין, ניתן להמשיך
PostMan

Postman is an amazing application. It's a tool that allows developers to make HTTP requests extremely easy, save examples, work under different environments, we LOVE it!

Postman is downloadable for free use from here and supported with lots of developer docs here.

We are providing you the full collection of this API for your usage with Postman, this collection includes examples of different requests & responses, the endpoints, documentation to immensely ease your interaction with our API.

After downloading Postman click on the following button to download our collection:

Run in Postman
Generate code using Postman

Postman allows for easy code generation to use with your favorite language.

Reference
Hypay API
Hypay API Calls Example

Note: you'll need to update the calls to your Terminal Information after opening a test/production terminal at Hypay, before attempting to run.
No action selected

You can try selecting ‘Hypay API Calls Example’ from the left column.
Learn more about using the documentation.
