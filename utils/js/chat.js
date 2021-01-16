var ws_url = '127.0.0.1:10000';
heads = new Map();

$(document).ready(function(){
    var ws;
    var uuid = $.cookie("uuid");
    var token = $.cookie('token');
    var name = $.cookie('user_name');

    var type = $.cookie('type');

    if(type == 'create'){
        //创建
        var url = "ws://" + ws_url + "/chat/create?token=" + token + "&uuid=" + uuid + "&name=" + name;
        ws = new WebSocket(url);

        ws.onopen = function (event) {
            console.log("ws has been established!");
        };

        ws.onmessage = function (event) {
            var msg = JSON.parse(event.data);
            console.log(msg);
            if(msg.type == "ADMIN" && msg.description.msg_type != "ALERT" && msg.description.code != 200){
                //返回消息有错误，弹窗提示重试
                console.log("ERROR!!!");
                alert("创建失败，请刷新重试！");
            }
            else{
                if(msg.type == "ADMIN"){
                    //系统消息
                    if(msg.description.msg_type == "CREATE" && msg.description.code == 200){
                        //创建成功，更新房间id
                        $(".meeting_id").text("会议号：" + msg.description.msg);
                        adminMsg("CREATE", msg.description.msg);
                    }
                    else if(msg.description.msg_type == "ALERT"){
                        //加入退出消息
                        msg = msg.description.msg.split(":");
                        adminMsg(msg[0], msg[2], msg[1]);
                    }
                }
                else{
                    //用户消息
                    if(msg.description.uuid != uuid){
                        //排除自己发的消息
                        userMsg(msg.description.name, msg.description.uuid, msg.description.msg);
                    }
                }
            }
        }

        ws.onclose = function (event) {
            console.log("ws has been closed!");
            alert("链接失败，请刷新重试~");
        }

        ws.onerror = function (event){
            console.log(event);
            //链接失败，弹窗报错重试
            alert("创建失败，请刷新重试~");
        }
    }
    else{
        // 加入会议
        var room_id = $.cookie("meeting_id");
        var url = "ws://" + ws_url + "/chat/join?token=" + token + "&uuid=" + uuid + "&name=" + name + "&room_id=" + room_id;
        ws = new WebSocket(url);

        ws.onopen = function(event){
            console.log("ws has been established!");
        };

        ws.onmessage = function(event){
            var msg = JSON.parse(event.data);
            console.log(msg);
            if(msg.type == "ADMIN" && msg.description.msg_type != "ALERT" && msg.description.code != 200){
                //返回消息有错误，弹窗提示重试
                console.log("ERROR!!!");
            }
            else{
                if(msg.type == "ADMIN"){
                    //系统消息
                    if(msg.description.msg_type == 'JOIN'){
                        // join success
                        $(".meeting_id").text("会议号：" + room_id);
                        adminMsg("JOIN", msg.description.msg);
                    }
                    else if(msg.description.msg_type == "ALERT"){
                        //加入退出消息
                        msg = msg.description.msg.split(":");
                        adminMsg(msg[0], msg[2], msg[1]);
                    }
                }
                else{
                    console.log(msg.description.uuid);
                    console.log(uuid);
                    //用户消息
                    if(msg.description.uuid !== uuid){
                        //排除自己发的消息
                        console.log(111);
                        userMsg(msg.description.name, msg.description.uuid, msg.description.msg);
                    }
                }
            }
        }

        ws.onclose = function (event) {
            console.log("ws has been closed!");
            alert("链接失败，请刷新重试~");
        }

        ws.onerror = function (event) {
            console.log(event);
            alert("加入失败，请刷新重试~");
        }
    }

    $("#send_msg").click(function (){
        //点击发送消息
        var waiting_for_send = $("#input_msg").val();
        if(waiting_for_send == ''){
            alert("请输入有效消息~");
        }
        else{
            var msg_2_send = "{'type': 'TEXT', 'msg': '" + waiting_for_send + "'}";
            ws.send(msg_2_send);
            $("#input_msg").val("");
            //上屏
            $(".main_content").append(
                "<div class=\"self_msg\">\n" +
                "            <div class=\"right\">\n" +
                "                <p>" +waiting_for_send + "</p>\n" +
                "            </div>\n" +
                "            <div class=\"clear\"></div>\n" +
                "            <br><br>\n" +
                "</div>"
            );
            window.scrollTo(0, document.documentElement.clientHeight);
        }
    })
});

function adminMsg(type, msg, uuid=null){
    switch (type){
        case "ENTER":
            //加入会议
            $(".main_content").append(
                "<div class=\"admin_msg\">\n" +
                "            <p>" + msg + " 加入会议</p>\n" +
                "</div><br>"
            )
            window.scrollTo(0, document.documentElement.clientHeight);
            heads.set(uuid, gen_text_img([100, 100], msg[0]));
            break;
        case "LEFT":
            $(".main_content").append(
                "<div class=\"admin_msg\">\n" +
                "            <p>" + msg + " 离开会议</p>\n" +
                "</div><br>"
            )
            window.scrollTo(0, document.documentElement.clientHeight);
            heads.delete(uuid)
            break;
        case "CREATE":
            $(".main_content").append(
                "<div class=\"admin_msg\">\n" +
                "            <p>会议创建成功，可以邀请朋友啦!会议号：" + msg + "</p>\n" +
                "</div><br>"
            );
            window.scrollTo(0, document.documentElement.clientHeight);
            break;
        case "JOIN":
            var attendees = '';
            for(var key in msg){
                attendees += (msg[key] + ", ");
                //给同组成员画头像
                heads.set(key, gen_text_img([100, 100], msg[key][0]));
            }
            $(".main_content").append(
                "<div class=\"admin_msg\">\n" +
                "            <p>会议加入成功!<br>同组会议成员还有：" + attendees + "</p>\n" +
                "        </div><br>"
            );
            window.scrollTo(0, document.documentElement.clientHeight);
            break;
    }
}

function userMsg(name, uuid, msg) {
    var head_url = heads.get(uuid);
    $(".main_content").append(
        "<div class=\"attendees_msg\">\n" +
        "            <img class=\"attendees_head\" src=\"" + head_url + "\">\n" +
        "            <div class=\"attendee_name\">" + name + "</div>\n" +
        "            <div class=\"left\">\n" +
        "                <p>" + msg + "</p>\n" +
        "            </div>\n" +
        "            <br><br>\n" +
        "        </div>"
    );
    window.scrollTo(0, document.documentElement.clientHeight);
}

function gen_text_img(size, s) {
    let colors = [
        "rgb(239,150,26)", 'rgb(255,58,201)', "rgb(111,75,255)", "rgb(36,174,34)", "rgb(80,80,80)"
    ];
    let cvs = document.createElement("canvas");
    cvs.setAttribute('width', size[0]);
    cvs.setAttribute('height', size[1]);
    let ctx = cvs.getContext("2d");
    ctx.fillStyle = colors[Math.floor(Math.random()*(colors.length))];
    ctx.fillRect(0, 0, size[0], size[1]);
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = size[0]*0.6+"px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(s,size[0]/2,size[1]/2);

    return  cvs.toDataURL('image/jpeg', 1);
}