var ws_url = '127.0.0.1:10000';

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
        }

        ws.onclose = function (event) {
            console.log("ws has been closed!");
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
                "        </div>"
            );
            window.scrollTo(0, document.documentElement.clientHeight);
        }
    })
});