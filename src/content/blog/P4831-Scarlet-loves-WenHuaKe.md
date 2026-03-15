---
title: "题解：P4831 Scarlet loves WenHuaKe"
pubDatetime: 2025-03-09T05:00:17.000Z
tags: ["图论","题解","洛谷"]
featured: false
draft: false
description: "提供一种可能更容易理解，不涉及太多式子的方法。"
---

提供一种可能更容易理解，不涉及太多式子的方法。

### 思路

由于摆放 $2n$ 个炮，因此每行一定是恰好两个炮的。假设我们已知前 $m-1$ 列的摆放方案数，考虑对第 $m$ 列的摆放情况做分类讨论。

首先，如果第 $m$ 列不摆放任何炮，那么 $n\times m$ 的方案数等价于 $n\times(m-1)$ 的方案数。

如果第 $m$ 列摆放了 $2$ 个炮，我们可以想到先枚举是哪两行放了（共 $\binom{n}{2}$ 种情况），然后讨论这两行的前一门炮的所在的列。若这两行的前一个炮在同一个列（共 $m-1$ 个可能的列），那么方案数等于将这两行两列去掉（即 $(n-2)\times (m-2)$ 的方案数）。若不相同，我们可以认为先合并这两列，等价于去掉这一行一列后，变为 $(n-1)\times (m-1)$ 的情况（同时根据这两列的顺序乘 $2$）。（可以参考下图，本人手绘有些简陋，请谅解）

![](https://cdn.luogu.com.cn/upload/image_hosting/nzf6p2zn.png)

最后考虑第 $m$ 列放了一个炮的情况。类似前面的情况，我们枚举炮在哪一行，以及这一行前一个炮在哪一列。去掉这一行这一列后，问题变为 $(n-1)\times (m-1)$ 的情况。但是，因为去掉的这一行在前面的那一列有一个炮，因此应该求解 $(n-1)\times (m-1)$，其中一列炮数目 $\leq 1$ 的方案数。这个 $\leq 1$ 的方案数相当于总方案数减去列炮数为 $2$ 的方案数（即上一段），按照上面的方法计算就好。

当我们要求 $n\times m$ 时，我们只需要知道 $(n-1)\times (m-1)$，$(n-2)\times (m-2)$，$n\times (m-1)$ 的方案，因为当 $n<m$ 时是无解的，所以总共的状态数是 $O(n(m-n))$ 的，时间复杂度也是这样的。我们可以递归求解，边界为 $n=0$，此时答案为 $1$。

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=1e5+5,M=998244353;
#define int ll
unordered_map<signed,int> g[N],h[N];
//h[i][j] i*j 放2个的方案数
int jc[N],inv[N];
int C(int x,int y){
    if(x<y||x<0||y<0)return 0;
    return ((jc[x]*inv[y])%M*inv[x-y])%M;
}
int qpow(int x,int p){
    int ret=1;
    while(p){
        if(p&1)ret=(ret*x)%M;
        x=(x*x)%M;
        p>>=1;
    }
    return ret;
}
int f(int x,int y){
    //x行y列的方案数
    if(x>y||x<0)return 0;if(x==0)return 1;  
    if(g[x][y])return g[x][y];
    g[x][y]=h[x][y]=0;  
    //放两个
    if(x>=2){
        g[x][y]=((C(x,2)*(y-1))%M*f(x-2,y-2))%M;//前一门炮所在列相同
        g[x][y]+=(C(x,2)*2*f(x-1,y-1))%M;//上一个不同
    }
    h[x][y]=g[x][y]=(g[x][y])%M;
    g[x][y]+=f(x,y-1);//一个都不放
    //放一个
    if(x>=1)g[x][y]+=(((f(x-1,y-1)-h[x-1][y-1])*x)%M*(y-1))%M;
    g[x][y]%=M;g[x][y]+=M;g[x][y]%=M;
    return g[x][y];
}
signed main(){
    jc[0]=1;
    for(int i=1;i<=1e5;i++)jc[i]=(jc[i-1]*i)%M;
    inv[100000]=qpow(jc[100000],M-2);
    for(int i=1e5-1;i>=0;i--)inv[i]=(inv[i+1]*(i+1))%M;
    int n,m;cin>>n>>m;
    cout<<f(n,m)<<endl;
    return 0;
}
```
