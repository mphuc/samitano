$(function(){
    startTimer();
    function startTimer() {
        var presentTime = $('input[name="time_countdow"]').val();
        var timeArray = presentTime.split(/[:]+/);
        var m = timeArray[0];
        var s = checkSecond((timeArray[1] - 1));
        if (s == 59) {
            m = m - 1
        }
        
        if(m == 0 && s == 0){
            location.reload(true);
            $('.base').hide();
        }
        $('input[name="time_countdow"]').val(
            m + ":" + s);
        /*if (parseInt(m) < 10) m = '0'+ m;
        if (parseInt(s) < 10) s = '0'+ s;*/
        $('.base').html( '00:'+ m+ ":" + s);
        setTimeout(startTimer, 1000);
    }

    function checkSecond(sec) {
        if (sec < 10 && sec >= 0) {
            sec = "0" + sec
        };
        if (sec < 0) {
            sec = "59"
        };
        return sec;
    }
})
