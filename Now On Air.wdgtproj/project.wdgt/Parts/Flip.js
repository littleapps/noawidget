function Flip(b,r,n) {
	this.button = document.getElementById (b);
	this.rollie = document.getElementById (r);
	if(!n) n = b;
	this.name = n;
	this.animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null}
}
Flip.prototype = {
	shown : false,

	show : function (event){
		if (!this.shown) {
			this.opacityTo(100)
			this.shown = true;
		}
	},

	hide : function(event) {
		if (this.shown) {
		// 情報ボタンをフェードイン表示する
			this.opacityTo(0)
			this.shown = false;
		}
	},

	animate : function() {
		var T;
		var ease;
		var time = (new Date).getTime();
					
			
		T = this.limit_3(time-this.animation.starttime, 0, this.animation.duration);
			
		if (T >= this.animation.duration) {
			clearInterval (this.animation.timer);
			this.animation.timer = null;
			this.animation.now = this.animation.to;
		} else {
			ease = 0.5 - (0.5 * Math.cos(Math.PI * T / this.animation.duration));
			this.animation.now = this.computeNextFloat (this.animation.from, this.animation.to, ease);
		}
			
		this.animation.firstElement.style.opacity = this.animation.now;
	},

	limit_3 : function(a, b, c) {
		return a < b ? b : (a > c ? c : a);
	},

	computeNextFloat : function(from, to, ease) {
		return from + (to - from) * ease;
	},

	over : function(event) {
		this.rollie.style.display = 'block';
	},

	out : function(event) {
		this.rollie.style.display = 'none';
	},
	
	isOver : function() {
		return this.rollie.style.display == 'block';
		
	},
	
	setOpacity : function(param) {
		this.button.style.opacity = param.toString()
		var op = parseInt(this.button.style.opacity)/100
		//alert(op)
		if(isNaN(op)) op = 1;
		this.animation.now = op;
	
	},
	opacityTo : function(param) {
		if (this.animation.timer != null) {
			clearInterval (this.animation.timer);
			this.animation.timer  = null;
		}

		var starttime = (new Date).getTime() - 13;
		
		this.animation.duration = 500;
		this.animation.starttime = starttime;
		this.animation.firstElement = this.button;
		this.animation.timer = setInterval (this.name+".animate();", 13);
		this.animation.from = this.animation.now;
		this.animation.to = param ? param/100 : 0;
		this.animate();
	}
}