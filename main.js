const { TeamSpeakClient } = require("node-ts");
const MAX_GROUP_COUNT = process.env.ts3maxgroupcount

async function main() {
    


    try {
    	const client = new TeamSpeakClient(process.env.ts3address);
        await client.connect();

        await client.send("use", { sid: 1 });

        const me = await client.send("whoami");
        console.log(me);

        // Log in to use more features
        await client.send("login", {
            client_login_name: process.env.ts3username,
            client_login_password: process.env.ts3password
        });

        await client.send('clientupdate', {
            //clid: me.client_id,
            client_nickname: process.env.ts3nickname
        }).catch(()=>{
			
		})

        const removeGrpoups = () => {
            client.send("clientlist", {}, ['groups']).then(clinetList => {
                clinetList.response.forEach(cln => {
                    const groupArr = getGroupsAsArray(cln.client_servergroups)
                    let fgl = groupArr.filter(e => !GROUPS_TO_IGNORE.includes(e))
                    if (fgl.length > MAX_GROUP_COUNT) {
                        console.log(cln.client_nickname)
                        console.log("Groups to remove ", fgl.length - MAX_GROUP_COUNT)
                        for (let index = 0; index < fgl.length - MAX_GROUP_COUNT; index++) {
                            const groupId = fgl[index];
                            client.send("servergroupdelclient", {
                                sgid: groupId,
                                cldbid: cln.client_database_id
                            })
                        }
                    }
                })
            }).catch(()=>{}).finally(()=>{
				setTimeout(()=>{
					client.send('quit')
					console.log("done")
				},20*1000)
			})
			
        }
        removeGrpoups()

    } catch (err) {
        console.error("An error occurred:")
        console.error(err);
    }
}
setInterval(main, 1 * 60 * 1000)
main();

function getGroupsAsArray(groupStr) {
    if (typeof groupStr === typeof 1) return [groupStr]
    let arr = groupStr.split(',')
    return arr.map(e => +e).filter(e => e > 0)
}
const GROUPS_TO_IGNORE = [
    12, // Block
    64, // Icon Template
    20, // DOWNLOAD
    7, // NORMAL
    39, //GUEST
    49, // Sticky
    95, // ChatMute
    9, // V
    10, // S
    6 // A
]
