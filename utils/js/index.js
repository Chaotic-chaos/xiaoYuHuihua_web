var ws_url = '127.0.0.1:10000';

$(document).ready(function(){
    // find uuid if in cookie
    var uuid;
    if($.cookie('uuid') != null){
        // access uuid
        uuid = $.cookie('uuid');
    }
    else{
        //generate uuid & save in cookie, expires in 7 days
        uuid = getUuid();
        $.cookie('uuid', uuid, {expires: 7, path: '/'});
    }

    // ask for token
    $.get('http://' + ws_url + '/getID?uuid=' + uuid, function (data){
        if(data.status_code != 200){
            // failed
            alert("获取身份失败，请重试");
        }
        else{
            $.cookie('token', data.description, {path: '/'});
        }
    })

    $.get('http://' + ws_url + '/count_active_users', function(data){
        // count curren active user count
        data = data.split(',');
        $('#current_meeting_count').text("当前会议数：" + data[0]);
        $("#current_user_count").text("当前在线人数：" + data[1]);
    })

    $("#create_meeting").click(function(){
        // get user name & save into cookie which expires after browser closed
        var name = $("#user_name").val();
        if(name == ''){
            alert('请输入您要在会议中显示的姓名');
        }
        else{
            $.removeCookie('user_name')
            $.cookie('user_name', name);
            $.cookie('type', 'create');
            $(location).attr('href', 'chat.html');
        }
    })

    $("#join_meeting").click(function(){
        // get user_name and meeting_id & save into cookie which expires after browser closed
        var name = $("#user_name").val();
        var meeting_id = $("#meeting_id").val();
        if(name == '' || meeting_id == ''){
            alert("请输入您要在会议中显示的姓名以及要加入的会议号");
        }
        else{
            $.removeCookie('user_name')
            $.removeCookie('type');
            $.cookie('user_name', name, {path: '/'});
            $.cookie('meeting_id', meeting_id, {path: '/',});
            $.cookie('type', 'join');
            $(location).attr('href', 'chat.html');
        }
    })
})

// 生成uuid
function getUuid() {
    var s = [];
    var hexDigits = "0123456789abcdef" ;
    for ( var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4" ; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-" ;

    var uuid = s.join( "" );
    return uuid;
}