---
title: "我的npy莫反！"
category: "闲话"
pubDatetime: 2025-10-19T11:43:38.000Z
tags: ["数论","数据结构","洛谷","闲话"]
featured: false
draft: false
description: "求 sum limits_{i=1}^{n } sum limits_{j=1}^{m} [sigma_1(gcd(i,j)) le a] sigma_1(gcd(i,j)),n,mle 10^5,qle 2times 10^4"
---

嘻嘻。

比较神奇的题。

求 $\sum \limits_{i=1}^{n } \sum \limits_{j=1}^{m} [\sigma_1(\gcd(i,j)) \le a] \sigma_1(\gcd(i,j)),n,m\le 10^5,q\le 2\times 10^4$

$$
\begin{align} &\sum \limits_{i=1}^{n } \sum \limits_{j=1}^{m} [\sigma_1(\gcd(i,j)) \le a] \sigma_1(\gcd(i,j))\\ &=\sum \limits_{d=1}^n \sum \limits_{i=1}^{\frac nd} \sum \limits_{j=1}^{\frac md}[\sigma_1(d)\le a][\gcd(i,j)=1] \sigma_1(d) 
\\&= \sum \limits_{d=1}^n \sigma_1(d)[\sigma_1(d)\le a]\sum \limits_{i=1}^\frac nd\sum\limits_{j=1}^\frac md [\gcd(i,j)=1] \\&=
\sum \limits_{d=1}^n \sigma_1(d)[\sigma_1(d)\le a]\sum \limits_{i=1}^\frac nd\sum\limits_{j=1}^\frac md \sum \limits_{k|\gcd(i,j)}\mu(k)
\\&= \sum \limits_{d=1}^n \sigma_1(d)[\sigma_1(d)\le a]\sum \limits_{k=1}^\frac nd\lfloor \frac{n}{dk}\rfloor \lfloor \frac{m}{dk} \rfloor \mu(k)
\end{align}

$$

设 $T=dk$

$$
\begin{align}&= \sum \limits_{T=1}^n \lfloor \frac{n}{T}\rfloor \lfloor \frac{m}{T} \rfloor \sum \limits_{k|T} \mu(k)  \sigma_1(\frac Tk) [\sigma_1(\frac Tk)\le a] \end{align}

$$

后面那个式子可以看为一个关于 $(T,a)$ 的函数。考虑预处理 $\sigma_1(x)$ 并将函数值从小到大排序，将询问按照 $a$ 从小到大排序。每次前面的整除分块相当于求一个前缀和询问，我们需要用数据结构维护后面那个东西。树状数组可以。每次 $a$ 变大后，加入一个 $\sigma_1(k)$相当于在 $k,2k,3k,...$ 增加 $\mu(1)\sigma_1(k), \mu(2)\sigma_1(k)...$。最终插入次数调和级数。于是这部分复杂度 $O(n \log^2 n)$。整除分块复杂度 $O(T \sqrt n \log n)$。 

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
#define int ll
const int N=1e5+5,M=(1ll<<31);
struct BIT{
    int t[N<<1];
    int query(int x){
        int ret=0;
        for(;x;x-=(x&-x)){
            ret+=t[x];ret%=M;
        }
        return ret;
    }
    void add(int pos,int x){
        for(;pos<N;pos+=(pos&-pos))t[pos]+=x,t[pos]+=M,t[pos]%=M;
    }
}t;
pair<int,int> s1[N];
int mu[N],p[N],pcnt;
bool isp[N];
void init(){
    mu[1]=1;
    for(int i=2;i<=N-5;i++){
        if(!isp[i])p[++pcnt]=i,mu[i]=-1;
        for(int j=1;j<=pcnt and (i*p[j])<=N-5;j++){
            isp[i*p[j]]=1;
            if(i%p[j]==0){
                mu[i*p[j]]=0;
                break;
            }
            mu[i*p[j]]=-mu[i];
        }
    }
    for(int i=1;i<=N-5;i++){
        s1[i].second=i;
        for(int j=i;j<=N-5;j+=i){
            s1[j].first+=i;
        }
    }
    // cerr<<s1[1].first<<" "<<s1[2].first<<" "<<s1[3].first<<" "<<s1[4].first<<endl;
    sort(s1+1,s1+1+100000);
}

struct query{
    int n,m,a,id;
    bool operator<(const query &A){return a<A.a;}
}q[N];
int ans[N];
int T;
signed main(){
    cin>>T;
    init();
    for(int i=1;i<=T;i++){
        cin>>q[i].n>>q[i].m>>q[i].a;q[i].id=i;
        if(q[i].n>q[i].m)swap(q[i].n,q[i].m);
    }
    sort(q+1,q+1+T);int itr=1;
    for(int i=1;i<=T;i++){
        while(itr<=1e5 and s1[itr].first<=q[i].a){
            for(int j=s1[itr].second;j<=N-5;j+=s1[itr].second){
                t.add(j,s1[itr].first*mu[j/s1[itr].second]);
            }
            itr++;
        }
        for(int l=1,r;l<=q[i].n;l=r+1){
            r=min(q[i].n/(q[i].n/l),q[i].m/(q[i].m/l));
            ans[q[i].id]+=((q[i].n/l)*(q[i].m/l)%M)*(t.query(r)-t.query(l-1))%M;
            ans[q[i].id]%=M;
        }
    }
    for(int i=1;i<=T;i++)cout<<(ans[i]+M)%M<<endl;
    return 0;
}
```
