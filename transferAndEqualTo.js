// 隐式转换

// 基础类型：undefined | null | string | Number | Boolean
// 引用类型：array | object | function

// 约定： ”=>“ 符号表示结果，”->“ 符号表示转换

/* 基础类型之间 == 比较 */
console.log(`
#----------- 基础类型之间 == 比较 -----------#
#----------- 基础类型之间 == 比较 -----------#
#----------- 基础类型之间 == 比较 -----------#

#----------- boolean == number -----------#
@: Boolean 与 Number 进行 ”==“ 比较时，会将 Boolean 转换为 Number;
@: Boolean -> Number: false -> 0, true -> 1
@: Number -> Boolean: 除 0 以外，均为 true，0 -> false

1 == true 		=> ${1== true}
0 == false 		=> ${0 == false}
10 == true 		=> ${10 == true}
-2 == false 	=> ${-2 == false}

!!(10) 			=> ${!!(10)}
!!(-1) 			=> ${!!(-1)}
!!(0) 			=> ${!!(0)}
Number(true)	=> ${Number(true)}
Number(false)	=> ${Number(false)}

#----------- number == string -----------#
@: Number 与 String 进行 ”==“ 比较时，String -> Number;

10 == '10'		=> ${10 == '10'}
10 == 'a'		=> ${10 == 'a'}
-10 == 'a'		=> ${-10 == 'a'}
1 == ''			=> ${1 == ''}
0 == ''			=> ${0 == ''}
-1 == ''		=> ${-1 == ''}

Number('')		=> ${Number('')}
Number('1')		=> ${Number('1')}
Number('0')		=> ${Number('0')}
Number('a')		=> ${Number('a')}

'a' * 1 		=> ${'a' * 1}
'a' / 1 		=> ${'a' / 1}
'a' | 0 		=> ${'a' | 0}
'a' & 0 		=> ${'a' & 0}
'10' * 1 		=> ${'10' * 1}
'10' / 1 		=> ${'10' / 1}
'10' | 0 		=> ${'10' | 0}
'10' & 0 		=> ${'10' & 0}

#----------- boolean == string -----------#
@: String 与 Boolean 进行 ”==“ 比较时，会将 Boolean -> Number;

true == 'a' 	=> ${'a' == true}
false == 'a'  	=> ${'a' == false}
true == '1' 	=> ${'1' == true}
false == '1'  	=> ${'1' == false}
true == '0' 	=> ${'0' == true}
false = '0'  	=> ${'0' == false}
true == ''		=> ${'' == true}
false == ’‘ 	=> ${'' == false}

#----------- null 与 undefined -----------#
@: null 与 undefined 在进行 ”==“ 比较时，不会转换为任何类型
@: 特性 numm == undefined => true

🎉 null == undefined  => ${null == undefined}
null == 1  		=> ${null == 1}
null == 0  		=> ${null == 0}
null == -1  	=> ${null == -1}
null == ''  	=> ${null == ''}
null == 'a'  	=> ${null == 'a'}
null == '1'  	=> ${null == '1'}
null == true  	=> ${null == true}
null == false  	=> ${null == false}

!!(null)		=> ${!!(null)}
🎉 Number(null)	=> ${Number(null)}

undefined == 1  	=> ${undefined == 1}
undefined == 0  	=> ${undefined == 0}
undefined == -1  	=> ${undefined == -1}
undefined == ''  	=> ${undefined == ''}
undefined == 'a'  	=> ${undefined == 'a'}
undefined == '1'  	=> ${undefined == '1'}
undefined == true  	=> ${undefined == true}
undefined == false  => ${undefined == false}

!!(undefined)	=> ${!!(undefined)}
Number(undefined)	=> ${Number(undefined)}
`);

/* 引用类型之间 == 比较 */
console.log(`
#----------- 引用类型之间 == 比较 -----------#
#----------- 引用类型之间 == 比较 -----------#
#----------- 引用类型之间 == 比较 -----------#
@: 引用类型比较是基于其指针（内存地址）进行比较

[] == [] 							=> ${[] == []}
{} == {} 							=> ${{} == {}}
function() {} == function() {} 		=> ${function() {} == function() {}}
[] = {}								=> ${[] == {}}
function() {} = {}					=> ${function() {} == {}}
function() {} = []					=> ${function() {} == []}
`);

/* 引用类型与基础类型之间 == 比较 */
console.log(`
#----------- 引用类型与基础类型之间 == 比较 -----------#
#----------- 引用类型与基础类型之间 == 比较 -----------#
#----------- 引用类型与基础类型之间 == 比较 -----------#
@: 引用类型与基础类型之间会先调用引用类型的 toString 或 valueOf 的方法
@: 一般滴，会先调用引用类型的 valueOf 方法
		若其返回值的类型是基础类型，继续按照基础类型进行比较；
		若其返回值的类型仍然是引用类型，那么会调用 toString，根据其返回值进行比较。
@: 但是有个例外，Date 对象当其出现在 ”+“ 运算符中，调用其 toString 方法，当出现在其他运算中时，调用 valueOf 方法。

{ toString: () => 1, valueOf: () => [] } == 1 				=> ${{ toString: () => 1, valueOf: () => [] } == 1}
{ toString: () => 1, valueOf: () => [] } == 0 				=> ${{ toString: () => 0, valueOf: () => [] } == 0}
{ toString: () => true, valueOf: () => [] } == 1 			=> ${{ toString: () => true, valueOf: () => [] } == 1}
{ toString: () => false, valueOf: () => [] } == 0 			=> ${{ toString: () => false, valueOf: () => [] } == 0}
{ toString: () => '1', valueOf: () => [] } == 1 			=> ${{ toString: () => '1', valueOf: () => [] } == 1}
{ toString: () => '0', valueOf: () => [] } == 0 			=> ${{ toString: () => '0', valueOf: () => [] } == 0}
{ toString: () => 'a', valueOf: () => [] } == 1 			=> ${{ toString: () => 'a', valueOf: () => [] } == 1}
{ toString: () => 'a', valueOf: () => [] } == 'a' 			=> ${{ toString: () => 'a', valueOf: () => [] } == 'a'}
{ toString: () => null, valueOf: () => [] } == false 		=> ${{ toString: () => null, valueOf: () => [] } == false}
{ toString: () => undefined, valueOf: () => [] } == false 	=> ${{ toString: () => undefined, valueOf: () => [] } == false}

{ toString: () => undefined, valueOf: () => false } == true => ${{ toString: () => undefined, valueOf: () => '' } == true}
{ toString: () => undefined, valueOf: () => '1' } == true 	=> ${{ toString: () => undefined, valueOf: () => '1' } == true}
{ toString: () => undefined, valueOf: () => false } == true => ${{ toString: () => undefined, valueOf: () => 1 } == true}
{ toString: () => undefined, valueOf: () => 0 } == false 	=> ${{ toString: () => undefined, valueOf: () => 0 } == false}

{ toString: () => true, valueOf: () => false } == true 		=> ${{ toString: () => true, valueOf: () => false } == true}
{ toString: () => true, valueOf: () => '' } == true 		=> ${{ toString: () => true, valueOf: () => '' } == true}
{ toString: () => false, valueOf: () => 1 } == false 		=> ${{ toString: () => false, valueOf: () => 1 } == false}

@: 当引用类型与 null 和 undefined 进行比较时，由于 null 的类型是 Obejct （引用类型），因此属于引用类型之间进行比较
@: 当引用类型与 null 和 undefined 进行比较时，由于 undefined 的类型是 undefined，undefined 与除了 null 和它自身以外的类型均为 false

🎉 { toString: () => undefined, valueOf: () => [] } == null 			=> ${{ toString: () => undefined, valueOf: () => [] } == null}
🎉 { toString: () => null, valueOf: () => [] } == undefined 			=> ${{ toString: () => null, valueOf: () => [] } == undefined}
🎉 { toString: () => undefined, valueOf: () => [] } == undefined 		=> ${{ toString: () => undefined, valueOf: () => [] } == undefined}
🎉 { toString: () => null, valueOf: () => [] } == null 					=> ${{ toString: () => null, valueOf: () => [] } == null}
🎉 { toString: () => null, valueOf: () => [] } == null 					=> ${{ toString: () => null, valueOf: () => null } == null}
🎉 { toString: () => undefined, valueOf: () => null } == null 			=> ${{ toString: () => undefined, valueOf: () => null } == null}
🎉 { toString: () => null, valueOf: () => undefined } == undefined 		=> ${{ toString: () => null, valueOf: () => undefined } == undefined}
🎉 { toString: () => undefined, valueOf: () => [] } == undefined 		=> ${{ toString: () => undefined, valueOf: () => undefined } == undefined}

// from https://www.haorooms.com/post/js_yinxingleixing
@: 大多数对象隐式转换为值类型都是首先尝试调用valueOf()方法。
	但是Date对象是个例外，此对象的valueOf()和toString()方法都经过精心重写，
	默认是调用toString()方法，比如使用+运算符，
	如果在其他算数运算环境中，则会转而调用valueOf()方法。

var date = new Date();
console.log(date + "1"); 	//Sun Apr 17 2014 17:54:48 GMT+0800 (CST)1
console.log(date + 1);		//Sun Apr 17 2014 17:54:48 GMT+0800 (CST)1
console.log(date - 1);		//1460886888556
console.log(date * 1);		//1460886888557
`);
