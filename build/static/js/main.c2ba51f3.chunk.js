(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{7:function(e,t,n){e.exports=n(8)},8:function(e,t,n){"use strict";n.r(t);var l=n(2),a=n(3),c=n(5),r=n(4),o=n(6),s=n(0),u=n(10),i=function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(c.a)(this,Object(r.a)(t).call(this,e))).state={books:[]},n}return Object(o.a)(t,e),Object(a.a)(t,[{key:"componentDidMount",value:function(){var e=this;fetch("/get").then(function(e){return e.json()}).then(function(t){e.setState({books:t})})}},{key:"render",value:function(){var e=this.state.books;return s.createElement("ul",null,e.map(function(e,t){return s.createElement("li",{class:"col"},s.createElement("figure",{class:"col-cover"},s.createElement("img",{src:e.cover,alt:e.title})),s.createElement("div",{class:"text-left"},s.createElement("p",{class:"col-title"},e.title),s.createElement("p",{class:"col-class"},"NDC\uff1a",e.ndl,"\uff0f",e.category),s.createElement("p",{class:"col-author"},e.author,s.createElement("span",{class:"col-author__kana"},"\uff0f",e.author_kana)),s.createElement("p",{class:"col-publisher"},"\u51fa\u7248\u793e\uff1a",e.publisher),s.createElement("div",null,s.createElement("form",{action:"/delete/",method:"get"},s.createElement("input",{type:"hidden",name:"isbn",value:e.isbn}),s.createElement("input",{type:"hidden",name:"ndl",value:e.ndl}),s.createElement("button",null,"DELETE")))))}))}}]),t}(s.Component);u.render(s.createElement(i,null),document.getElementById("content"))}},[[7,1,2]]]);
//# sourceMappingURL=main.c2ba51f3.chunk.js.map