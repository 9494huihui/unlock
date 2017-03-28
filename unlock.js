$(function() {
    var testUnlock = new unlock();
    testUnlock.init();
    }
);

var unlock = function(){ 
    this.n = 3; 
}; 

unlock.prototype = {
    constructor: unlock,

    //画空心圆
    drawCircle: function(x, y) {
        this.ctx.strokeStyle = '#CCCCFF'; 
        this.ctx.lineWidth = 2; 
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true); 
        this.ctx.closePath(); 
        this.ctx.stroke(); 
    },

    //填充所有点击过的圆
    drawPoint: function() {
        for (var i=0; i<this.clickPoint.length; i++) { 
            this.ctx.fillStyle = '#FF9900'; 
            this.ctx.beginPath(); 
            this.ctx.arc(this.clickPoint[i].x, this.clickPoint[i].y, this.r, 0, Math.PI * 2, true); 
            this.ctx.closePath(); 
            this.ctx.fill(); 
        } 
    },

    //画走过的直线
    drawLine: function(po, clickPoint) {
        this.ctx.strokeStyle = '#FF0000';  
        this.ctx.lineWidth = 2; 
        this.ctx.beginPath();
        this.ctx.moveTo(this.clickPoint[0].x, this.clickPoint[0].y); 
        for (var i = 1 ; i < this.clickPoint.length ; i++) { 
            this.ctx.lineTo(this.clickPoint[i].x, this.clickPoint[i].y); 
        } 
        this.ctx.lineTo(po.x, po.y); 
        
        this.ctx.stroke();  //
        this.ctx.closePath();//注意这两个顺序不能写反
    },

    //排列空圆
    createCircle: function() {
        var n = this.n;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
        this.clickPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        for (var i = 0 ; i < n ; i++) {
            for (var j = 0 ; j < n ; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r,
                    y: i * 4 * r + 3 * r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0 ; i < this.arr.length ; i++) {
            this.drawCircle(this.arr[i].x, this.arr[i].y);
        }
    },

    reset: function() {
        this.createCircle();
    },

    getPosition: function(e) {
        var rect = e.currentTarget.getBoundingClientRect(); 
        var po = { 
            x: e.touches[0].clientX - rect.left, 
            y: e.touches[0].clientY - rect.top 
        }; 
        return po; 
    },

    drawActive: function(po) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); 

        for (var i = 0 ; i < this.arr.length ; i++) {  
            this.drawCircle(this.arr[i].x, this.arr[i].y); 
        } 

        this.drawPoint(this.clickPoint);
        this.drawLine(po, this.clickPoint); 
        
        for (var i = 0 ; i < this.restPoint.length ; i++) { 
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) { 
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y); 
                this.clickPoint.push(this.restPoint[i]); 
                this.restPoint.splice(i, 1); 
            } 
        } 

    },

    comparePsw: function(psw1, psw2) {
        if (psw1.length != psw2.length) {
            return false;
        }
        for (var i=0; i<psw1.length; i++) {
            //console.log(psw1[i].index);
            //console.log(psw2[i].index);
            if (psw1[i].index != psw2[i].index) {
                return false;
            }
        }
        return true;
    },

    judgePsd: function(psw) { 
        if ($("input[type='radio']:checked").val() == 'setPwd') {
            if (this.step == 1) { 
                if (this.comparePsw(this.pswObj.fpassword, psw)) { 
                    this.pswObj.spassword = psw; 
                    document.getElementById('msg').innerHTML = '密码设置成功'; 
                    window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword)); 
                } 
                else { 
                    document.getElementById('msg').innerHTML = '两次输入的不一致'; 
                    setTimeout(function(){ 
                        document.getElementById('msg').innerHTML = '请输入手势密码';
                    }, 1000); 
                    delete this.step;
                } 
            }
            else {
                if (psw.length < 5) {
                    document.getElementById('msg').innerHTML = '密码太短，至少需要5个点';
                }
                else{
                    this.pswObj.fpassword = psw; 
                    document.getElementById('msg').innerHTML = '请再次输入手势密码';
                    this.step = 1; 
                }
            }
        }
        else if ($("input[type='radio']:checked").val() == 'valPwd') { 
            if (this.comparePsw(this.pswObj.spassword, psw)) { 
                document.getElementById('msg').innerHTML = '密码正确!';      
            } else {    
                document.getElementById('msg').innerHTML = '输入的密码不正确'; 
            } 
        } 
    },

    init: function() { 
        this.pswObj = {};
        this.step = 0; 
        this.touchFlag = false; 

        document.getElementById('msg').innerHTML = '请输入手势密码';
        this.canvas = document.getElementById('myCanvas'); 
        this.ctx = this.canvas.getContext('2d'); 
        this.ctx.canvas.height = this.ctx.canvas.width;

        this.createCircle();
        this.bangEvent(); 
    },
    
    bangEvent: function() { 
        var self = this; 
        //手指触摸屏幕触发
        this.canvas.addEventListener("touchstart", function (e) { 
            var po = self.getPosition(e); 
            
             for (var i = 0 ; i < self.arr.length ; i++) { 
                //判断是否在圆内
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) { 
                    self.touchFlag = true; 
                    self.drawPoint(self.arr[i].x,self.arr[i].y); 
                    self.clickPoint.push(self.arr[i]); 
                    self.restPoint.splice(i,1); 
                } 
             } 
         }, false); 
        //手指滑动时连续触发
         this.canvas.addEventListener("touchmove", function (e) { 
            if (self.touchFlag) { 
                self.drawActive(self.getPosition(e)); 
            } 
         }, false); 
         //手指离开时触发
         this.canvas.addEventListener("touchend", function (e) { 
             if (self.touchFlag) { 
                 self.touchFlag = false; 
                 self.judgePsd(self.clickPoint); 
                 setTimeout(function(){ 
                    self.reset(); 
                }, 300); 
             } 
         }, false);            
    } 
}