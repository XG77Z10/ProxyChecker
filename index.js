require('events').EventEmitter.defaultMaxListeners = 10000;


const ProxyAgent = require('proxy-agent'),
    request = require('request'),
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs'),
    args = process.argv.splice(2),
    proxies = fs.readFileSync(args[0], 'utf-8').replace(/\r/g, '').split('\n').filter(Boolean);

function color(text,color = "blue"){
  switch(color){
    case "red":
      return "\x1b[91m"+text+"\x1b[0m";
    break;
    case "green":
      return "\x1b[92m"+text+"\x1b[0m";
    break;
    case "blue":
      return "\x1b[94m"+text+"\x1b[0m";
    break;
    case "yellow":
      return "\x1b[93m"+text+"\x1b[0m";
    break;
    case "purple":
      return "\x1b[95m"+text+"\x1b[0m";
    break;
    case "white":
      return "\x1b[97m"+text+"\x1b[0m";
    break;
    case "cyan":
      return "\x1b[36m"+text+"\x1b[0m";
    break;
    case "bred":
      return "\x1b[41m"+text+"\x1b[0m";
    break;
    case "bgreen":
      return "\x1b[42m"+text+"\x1b[0m";
    break;
    case "bblue":
      return "\x1b[44m"+text+"\x1b[0m";
    break;
    case "byellow":
      return "\x1b[43m"+text+"\x1b[0m";
    break;
    case "bpurple":
      return "\x1b[45m"+text+"\x1b[0m";
    break;
    case "bwhite":
      return "\x1b[47m"+text+"\x1b[0m";
    break;
    case "bcyan":
      return "\x1b[46m"+text+"\x1b[0m";
  }
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
console.log("");
console.log(color("==============","bgreen") + color("==============","bred") + color("==============","byellow") + color("==============","bblue") + color("==============","bpurple") + color("==============","byellow"));
console.log("                    Proxy Checker NodeJS V1.0 Author :  Z1-ShopX1");
console.log(color("==============","bgreen") + color("==============","bred") + color("==============","byellow") + color("==============","bblue") + color("==============","bpurple") + color("==============","byellow"));
console.log("");
const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

//Return usage on lower then required argv length
if (args.length < 2) return console.log(`Usage: node ${path.basename(__filename)} {proxies.txt} {timeout}`);

class Checker {
    constructor(timeout, nProxy) {
        this.proxy_type = ['http', 'socks4', 'socks5'];
        this.n_proxy = nProxy;
        this.timeout = timeout;
        this.working = 0;
        this.not_working = 0;
        this.checked = 0;
        this.dead = chalk.hex('#D32F2F')('[DEAD] -> %s');
        this.alive = chalk.hex('#388E3C')('[%s] -> %s');
    }

    title(text) {
        if (process.platform === 'win32') {
            process.title = text;
        } else {
            process.stdout.write('\x1b]2;' + text + '\x1b\x5c');
        }
    }

    check(proxy) {
        //Loop true the length of proxy_type (in this case each proxy will be checked three times)
        for (let i = 0; i < this.proxy_type.length; ++i) {
            let proxy_type = this.proxy_type[i],
                options = {
                    uri: 'http://example.com',
                    method: 'GET',
                    agent: new ProxyAgent(proxy_type + '://' + proxy),
                    timeout: Number(this.timeout)
                };

            request.get(options, (error, response) => {
                //If proxy is dead then add to not_working
                if (error) {
                    console.log(this.dead, proxy);
                    return ++this.not_working;
                }

                //Check if body contains Example
                if (response.body.includes('Example')) {
                    //Save proxy to file
                    fs.appendFile(proxy_type.toUpperCase() + '.txt', proxy + '\n', (err) => {
                        if (err) throw err;

                        console.log(this.alive, proxy_type.toUpperCase(), proxy);
                        return ++this.working;
                    });
                } else {
                    //If does not have Example in body add to not_working
                    console.log(this.dead, proxy);
                    ++this.not_working;
                }

                //Log in title the proxy stats
                let total_working = this.not_working + this.working;
                this.title(`ALIVE: ${this.working}/${this.n_proxy} | CHECK: ${total_working}`);
            });


            //If the loop true proxy_type is done then add to checked
            if (i >= this.proxy_type.length - 1) {
                return ++this.checked;
            }
        }
    }
}

const client = new Checker(args[1], proxies.length);

let start = setInterval(() => {
    //If checked proxies are greater or equal to number of proxies then initialize stop
    if (client.checked >= client.n_proxy) {
        clearInterval(start);
        WaitNStop();
    }

    //check the proxy from the index of client.checked
    client.check(proxies[client.checked]);
});

//Simply wait until not working + working is greater or equal to numbers of proxy then exit
function WaitNStop() {
    setInterval(() => {
        if (client.not_working + client.working >= client.n_proxy) {
            console.log(chalk.hex('#388E3C')('DONE !\nWORKING: ' + client.working + '\nBAD: ' + client.not_working));
            process.exit(0)
        }
    });
}

start;