/**
 * Created by Administrator on 14-7-15.
 */

//    /*鼠标点击高亮*/
//    $(".nav ul li").each(function(i){
//    $(this).click(function(){
//        $(this).addClass("active").siblings().removeClass("active");
//    });
// });
(function(S){
    S.use("core",function(){
        var Event= S.Event,Dom= S.DOM;
        var $= S.all;
        /*鼠标划入事件*/
        Event.on(".cot-index","mouseenter",function(){
            S.one(".cot-round1").addClass("big");
            S.one(".cot-round2").addClass("small");
        });
        Event.on(".cot-index","mouseleave",function(){
            S.one(".cot-round1").removeClass("big");
            S.one(".cot-round2").removeClass("small");
        });

        /*鼠标点击高亮2*/
        var nave= S.all(".nave-tabs li");
        var title= S.all(".tab-content");
//        Event.on(nave[0],"click",function(){
//            $(this).addClass("active-tabs").siblings().removeClass("active-tabs");
//            title.children("div").item(0).fadeIn().siblings().hide();
//        });
//        Event.on(nave[1],"click",function(){
//            $(this).addClass("active-tabs").siblings().removeClass("active-tabs");
//            title.children("div").item(1).fadeIn().siblings().hide();
//        });
//        Event.on(nave[2],"click",function(){
//            $(this).addClass("active-tabs").siblings().removeClass("active-tabs");
//            title.children("div").item(2).fadeIn().siblings().hide();
//        });
//        Event.on(nave[3],"click",function(){
//            $(this).addClass("active-tabs").siblings().removeClass("active-tabs");
//            title.children("div").item(3).fadeIn().siblings().hide();
//        });
           nave.each(function(o,i){
              Event.on(nave[i],"click",function(){
                  $(this).addClass("active-tabs").siblings().removeClass("active-tabs");
                  title.children("div").item(i).fadeIn().siblings().hide();
              }) ;
           });


        /*右边导航栏*/
        var tab= S.all(".tab-content a");
         Event.on(tab,"mouseenter",function(event){
             var a=event.currentTarget;
             var ea= S.one(a);
             var $dd= ea.children("dl").children("dd");
             ea.children("span").css("background-color","#ff9c15");
             ea.children("span").children("img").attr("src","images/sanjiao2.png");
             $dd.css({left:"-325px"}).stop(true,false).animate({left:0},0.8,"bounceOut");
             ea.children("dl").children("dt").stop(true,false).fadeOut(0.3);
         });
        Event.on(tab,"mouseleave",function(event){
            var a=event.currentTarget;
            var ea= S.one(a);
            var $dd= ea.children("dl").children("dd");
            ea.children("span").css("background-color","#66a7ef");
            ea.children("span").children("img").attr("src","images/sanjiao.png");
            $dd.stop(true,false).animate({left:"-325px"},0.1,"bounceOut");
            ea.children("dl").children("dt").stop(true,false).fadeIn(0.2);
        });
    });
})(KISSY);