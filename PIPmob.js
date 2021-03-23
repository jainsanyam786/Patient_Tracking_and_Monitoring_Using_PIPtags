const exec = require('child_process').exec;
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mobile.embeddedsensor@gmail.com',
    pass: 'mobile.sensor1'
  }
});


var mailOptions = {
  from: 'mobile.embeddedsensor@gmail.com',
  to: 'mobile.embsensors@gmail.com',
  subject: 'Sending Email using Node.js',
  text:'Patient  has left the room!'
};

function sendEmail() {
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log("Email sending error");
		console.log(err);
        } else {
            console.log("STATUS : Email sent");
        }
    })
}


var cmd = "sudo stdbuf -o0 ./pip_sense.v2 l l | stdbuf -o0 grep TX:03404";
var out = exec(cmd);
var times = 0;
var oTimes =0;
var flag=0;
out.stdout.on('data', function(line) {
    var rssi = line.substring(
                line.lastIndexOf("RSSI") + 5,
                line.lastIndexOf("C") - 7)
    var rssiValue = Number(rssi) - 0;

    var light = line.substring(
                line.lastIndexOf("light") + 7,
                line.lastIndexOf("temp") - 1)
    var lumens = Number(light) - 0;

    var temp = line.substring(
                line.lastIndexOf("temp") + 6,
                line.lastIndexOf("humidity") - 1)
    var tempValue = Number(temp) - 0;
    var tx= line.substring(
                line.lastIndexOf("TX") + 3,
                line.lastIndexOf("RSSI") - 7)
     var txValue = Number(tx) - 0;



    console.log("RSSI VALUE : " +rssiValue);
    console.log("LIGHT SENSOR : " +lumens);
    console.log("TEMPERATURE SENSOR : " +tempValue);
    if(rssiValue > -40 && flag==0) {
        times = times + 1;
    }

    if(times > 5 && flag==0) {
	console.log("STATUS : Patient Inside");
	flag=1;
        times = 0;
    }

   if(flag==1 && rssiValue < -40)
	{
	oTimes = oTimes +1;
       }

   if (oTimes > 5)
{
	sendEmail();
	oTimes =0;
	flag=0;
}

if(flag==1 && lumens==0)
{
  console.log("ACTION REQUIRED : Switch on the lights as patient is inside");	
   }

if(flag==0 && lumens!=0)
{
   console.log("ACTION REQUIRED : Switch off the light ");
  }



console.log("...........................................................");
})
