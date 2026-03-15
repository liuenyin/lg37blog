---
title: "t17572371839fHe-gwQm4o4UHFA.md"
pubDatetime: 2026-03-15T08:47:46.249Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t17572371839fHe-gwQm4o4UHFA.md - 迁移自洛谷博客"
---

# Min_25 筛 学习笔记
posted on 2025-09-07 09:26:23 | under  | [source](https://www.luogu.com.cn/blog/_post/1039393)

## Min25筛

Min25筛可以在 $O(\frac{n^{\frac{3}{4}}}{\log n})$ 的复杂度内求一个积性函数 $f(p)$ 的前缀和，要求 $f(p)$ 为关于 $p$ 的简单多项式，且 $f(p^c)$ 可以快速计算。

我们对这个 $f(p)$ 的前缀和每一项按照素数和合数（和1）进行分类：

$$\sum\limits_{1\le i\le n}f(i)=\sum \limits_{p\in prime,p\le n}f(p)+\sum \limits_{i \notin prime,i\le n}f(i)$$

枚举每个合数的最小质因子及次数：

$$\sum \limits_{p\in prime,p\le n}f(p)+\sum \limits_{1\le p^k,1\le p\le \sqrt n}f(p^k) \sum \limits_{1\le i\le [\frac{n}{p^k}],\operatorname{lp}(i)>p}f(i)$$

其中 $\operatorname{lp}(x)$ 代表 $x$ 的最小质因子。

我们分成两步算上面这个式子。

### 1.求 $\sum \limits_{p\in prime,p\le n}f(p)$

记

$$g(n,j)=\sum \limits_{(i\in prime \ or \ \operatorname{lp}(i)>p_j) and \ i\le n} i^k$$

$i^k$ 为上文中“简单多项式”的一项（相当于把函数拆开来）。

当 $p_j^2>n$ 时，最小的满足 $\operatorname{lp}(x)=p_j$ 的数为 $p_j^2>n$，不会有贡献。

否则，考虑从 $g(n,j-1)$ 转移到 $g(n,j)$。这个转移的过程中剔除了最小质因子为 $p_j$ 且不满足条件的数的贡献，即：

$$g(n,j)=g(n,j-1)-p_j^k[g(\lfloor\frac{n}{p_j}\rfloor,j-1)-g(p_{j-1},j-1)]$$

关于 $p_j^k[g(\lfloor\frac{n}{p_j}\rfloor,j-1)-g(p_{j-1},j-1)]$：

这是最小质因子恰为 $p_j$ 的合数的贡献。这些合数可以表示为 $p_j\times x$，其中 $x$ 满足 $\operatorname{lp}(x)\ge p_j$。如何计算 $\sum x^k$？

- $g(\lfloor\frac{n}{p_j}\rfloor,j-1)$ 是所有素数或最小质因子大于 $p_{j-1}$ 的数的 $k$ 次方和。这恰好包含了所有 $x$ 和所有小于 $p_j$ 的素数（不需要这一部分，因为 $p_j$ 乘后者的最小质因子是后者自身）。因此要减去后者的贡献，即 $g(p_{j-1},j-1)$。（$=g(p_j-1,j-1)$，因为没有小于 $p_j$ 的合数的最小质因子大于 $p_{j-1}$，只包括了素数的贡献）。

所以我们有了 $g$ 的递推式：

$$g(n,j)=\left\{\begin{array}{l}g(n,j-1)& p_j^2>n\\g(n,j-1)-p_j^k[g([\frac{n}{p_j}],j-1)-g(p_j-1,j-1)] & p_j^2\leq n \end{array}\right.$$

$g(p_j-1,j-1)$ 就是 $\sum \limits_{i=1}^{j-1}p_i^k$，$j\le O(\frac{\sqrt n}{\ln n})$，可以直接线性筛。

同时根据整除点的性质（$|D_n|=O(\sqrt n)$），只需处理所有 $[\frac{n}{p_j}]$ 位置的 $g$。

在这一步之后，将 $g(n,j)$ 线性组合为 $\sum \limits_{(i\in prime \ or \ \operatorname{lp}(i)>p_j) and \ i\le n} f(i)$。

### 2.求后面一部分

记

$$S(n,j)=\sum \limits_{2\le i\le n,\operatorname{lp}(i)>p_j}f(i)$$

则我们的答案就是 $S(n,0)$。

可以将上式中满足条件的数分为两个部分：

- 大于 $p_j$ 的素数： $g(n,x)-g(p_j-1,j-1)$（其中 $x$ 是满足 $p_x^2\le n$ 的最大的 $x$）
- 大于 $p_j$ 的合数：枚举最小质因子，有 $\sum \limits_{p_k^e,k>j}f(p_k^e)(S([\frac{n}{p_k^e}],k)+[e\neq 1])$

所以有 $$S(n,j)=g(n,x)-g(p_j-1,j-1)+\sum_{p_k^e,k>j}f(p_k^e)(S([\frac{n}{p_k^e}],k)+[e\neq 1])$$

考虑直接爆搜。另外注意到上式不包含 $f(1)$，直接加上即可。

例题：

[SP34096 DIVCNTK](https://www.luogu.com.cn/problem/SP34096)

求 $\sum \limits_{i=1}^n \sigma_0(i^k)$。

不难发现 $f(1)=1,f(p)=k+1,f(p^e)=ke+1,f(ab)=f(a)f(b)$（$\gcd(a,b)=1$）。

直接做即可。

::::info[代码]
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
#define int unsigned long long//对 2^64取模
const int N=1e7+5;
int p[N],pcnt;
bool isp[N];
void init(int n){
    // p[0]=1;
    for(int i=2;i<=n;i++){
        if(!isp[i]){
            p[++pcnt]=i;
            // cout<<i<<endl;
        }
        for(int j=1;j<=pcnt and i*p[j]<=n;j++){
            isp[i*p[j]]=1;
            if(i%p[j]==0)break;
        }
    }
}
int T,n,k,sqn;
int g[N];//g[i] g(第i个整除点,j)的值(其中j被压维)
int d[N],ptr;//整除点
int pos[3][N];//d[x]的索引位置,pos[1][x]是小的（n/i）的位置
//,pos[2][x]是大的(n/i)的位置（存的是 x=n/(n/i)）
int S(int x,int y){
    //S(n,j)
    if(p[y]>x)return 0;
    int posx;
    if(x<=sqn)posx=pos[1][x];
    else posx=pos[2][n/x];
    int ans=g[posx]-y*(k+1);//y*(k+1)=g(p_y-1,y-1)
    for(int i=y+1,tmp;i<=pcnt and p[i]*p[i]<=x;i++){
        tmp=p[i];
        for(int e=1;tmp<=x;e++,tmp*=p[i]){
            //枚举p_i^e
            ans+=(k*e+1)*S(x/tmp,i);
            if(e>1)ans+=k*e+1;
        }
    }
    return ans;
}
signed main(){
    cin>>T;
    while(T--){
        pcnt=0;
        cin>>n>>k;
        sqn=sqrt(n);
        init(sqn);ptr=0;
        for(int i=1;i<=n;i=n/(n/i)+1){
            d[++ptr]=n/i;
            g[ptr]=n/i-1;//g(n/i,0)=n/i-1（不包含f(1)）
            if(n/i<=sqn)pos[1][n/i]=ptr;
            else pos[2][n/(n/i)]=ptr;
        }
        for(int i=1;i<=pcnt;i++){
            // cerr<<pcnt<<" "<<ptr<<" "<<p[i]<<" "<<d[1]<<endl;
            for(int j=1;j<=ptr and p[i]*p[i]<=d[j];j++){
                //计算g(d[j],i)
                int itr;
                if(d[j]/p[i]<=sqn)itr=pos[1][d[j]/p[i]];
                else itr=pos[2][n/(d[j]/p[i])];
                // cout<<i<<" "<<j<<" "<<itr<<endl;
                g[j]-=g[itr]-(i-1);//f(p)=k+1,多项式和p无关（相当于0次项），不用乘p的幂            
            }
        }
        for(int i=1;i<=ptr;i++)g[i]*=(k+1);//f(p)=k+1，现在 g[x]=g(第x个整除点，n)=【<=第x个整除点的f(p)和】
        // cerr<<g[1]<<" "<<g[2]<<" "<<g[3]<<" "<<g[4]<<endl;
        cout<<S(n,0)+1<<endl;
    }
    return 0;
}
```
::::

[LOJ #6202 叶氏筛法](https://loj.ac/p/6202)

$f(p)=p$。只需要第一部分。

[LOJ #572 Misaka Network 与求和](https://loj.ac/p/572)

