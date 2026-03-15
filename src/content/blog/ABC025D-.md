---
title: "ABC025D 题解"
pubDatetime: 2023-09-09T18:33:41.000Z
tags: ["动态规划","搜索","题解","洛谷"]
featured: false
draft: false
description: "[ABC025D](https://www.luogu.com.cn/problem/AT_abc025_d)"
---

### [ABC025D](https://www.luogu.com.cn/problem/AT_abc025_d)

### 分析:

（部分思路来自 [这篇题解](https://www.luogu.com.cn/blog/cosf/A40-ABC025D) ，在此感谢）

首先想到暴力搜索（类似数独问题），但是这种方法的问题就在于时间复杂度过高（约 $O(n!)$），显然无法通过。

再看题目，$5 \times 5$ 的网格和 $5s$ 的时限，可以想到状态压缩 DP。

因为状压只能表示出每个数填了没填，因此 DP 的时候需要有顺序，这里采用从小到大填。

对于状态 $S$，$S$ 在二进制中 $1$ 的个数即为当前要填的数（记为 $t$），若 $t$ 预先被填了（设位置为 $p_t$），则 $\large{ f_S\gets f_{(i \oplus 2^{p_t})}}$，即除了 $t$ 没有填的状态。否则，枚举 $t$ 的位置，并且对于可行的位置 $p$，有 $\large f_i \gets f_i +f_{(i \oplus 2^p)}$。边界条件 $f_0 =1$。

对于判断可行性，横向和纵向的差不多，因此这里只讨论横向的。如果一个格子在边缘，那么必然不会成为一个单调数列的中间项，可以不讨论。否则，如果左面或者右面只填了一个数（由于 DP 顺序，必然比当前数小），另外一面必然比当前数大，因此不可以。如果两面都填了，那么也可以填当前数。

时间复杂度 $O(n2^n)$，空间复杂度 $O(2^n)$，其中 $n=25$，均可通过。

### 代码

[原站记录](https://atcoder.jp/contests/abc025/submissions/45432123)

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=25;
const int M=1e9+7;
int c[N+5];//网格,c[i]表示数字i填的位置 
int f[(1<<N)];//dp 
//f[S] 中 S二进制从右往左第i位表示数字i是否填写过 

inline void add(int S,int place){
	if(place%5>0 and place%5<4 and ((S>>(place-1)&1)^(S>>(place+1)&1))){
		//在中间              两边只填了一个数字 
		return;
	} 
	if(place/5>0 and place/5<4 and ((S>>(place-5)&1)^(S>>(place+5)&1))){
		return;
	}
	f[S]=(f[S]+f[S^(1<<place)])%M;
	//cout<<f[S]<<" "<<S<<" "<<place<<endl;
}

int main(){
	for(int i=1;i<=25;i++){
		int tmp;cin>>tmp;
		c[tmp]=i;
	}
	int end=(1<<N);
	f[0]=1;
	for(int i=1;i<end;i++){
		int plc=c[__builtin_popcount(i)];
		//当前应该填的数字的位置 
		if(plc!=0){
			//已经填过了，只能填这个位置 
			add(i,plc-1);
		} 
		else{
			for(int j=1;j<=25;j++){
				if(i&(1<<(j-1))){
					add(i,j-1);
				}
			}
		}
	//	cout<<f[i]<<" ";
	} 
	cout<<f[end-1]<<endl; //记得换行!!!
	return 0;
}

```
