---
title: "CF1196F K-th Path 题解"
category: "题解"
pubDatetime: 2024-07-26T20:41:58.000Z
tags: ["图论","题解","洛谷","Codeforces"]
featured: false
draft: false
description: "前 k 条最短路只能由长度前 k 短的边构成，而 kleq 400，这 k 条边最多连接 2k 个点，因为可以任选两点所以可以将这 k 条边排序后找到这些点，用这些点和边跑一遍全源最短路，将每一条路径都从大到小排序取出第 k 大即可。"
---

前 $k$ 条最短路只能由长度前 $k$ 短的边构成，而 $k\leq 400$，这 $k$ 条边最多连接 $2k$ 个点，因为可以任选两点所以可以将这 $k$ 条边排序后找到这些点，用这些点和边跑一遍全源最短路，将每一条路径都从大到小排序取出第 $k$ 大即可。

时间复杂度 $O(k^3 + m \log m)$，可以通过本题。

```cpp
#include<bits/stdc++.h>
typedef long long ll;
const int N=2e5+5;
//只会用到前k短边
namespace fastio{
    struct reader{
    	template<typename T>reader&operator>>(T&x){
    		char c=getchar();short f=1;
    		while(c<'0'||c>'9'){if(c=='-')f*=-1;c=getchar();}
    		x=0;while(c>='0'&&c<='9'){
    			x=(x<<1)+(x<<3)+(c^48);
    			c=getchar();
    		}x*=f;return *this;
    	}
    }cin;
    struct writer{
        template<typename T>writer&operator<<(T x){
    		if(x==0)return putchar('0'),*this;
    		if(x<0)putchar('-'),x=-x;
    		static int sta[45];int top=0;
    		while(x)sta[++top]=x%10,x/=10;
    		while(top)putchar(sta[top]+'0'),--top;
    		return*this;
    	}
    }cout;
};
#define cin fastio::cin
#define cout fastio::cout
int n,m,k;
struct edge{
    int u,v,w;
    bool operator<(const edge &A)const{
        return this->w<A.w;
    }
}es[N];
int cf[N],id[N],cnt;
ll dis[1005][1005];
ll ans[1000005];
int main(){
    cin>>n>>m>>k;
    for(register int i=1;i<=m;i++)
        cin>>es[i].u>>es[i].v>>es[i].w;
    std::sort(es+1,es+1+m);
    for(register int i=1;i<=k;i++)
        cf[es[i].u]=cf[es[i].v]=1;
    for(register int i=1;i<=n;i++)id[i]=id[i-1]+cf[i];
    memset(dis,0x3f,sizeof dis);
    for(register int i=1;i<=k;i++)dis[id[es[i].u]][id[es[i].v]]=dis[id[es[i].v]][id[es[i].u]]=es[i].w;
    for(register int p=1;p<=id[n];p++){
        for(register int i=1;i<=id[n];i++){
            for(register int j=1;j<=id[n];j++){
                dis[i][j]=std::min(dis[i][j],dis[i][p]+dis[p][j]);
            }
        }
    }
    for(register int i=1;i<=id[n];i++){
        for(register int j=i+1;j<=id[n];j++){
            ans[++cnt]=dis[i][j];
        }
    }
    std::sort(ans+1,ans+1+cnt);
    cout<<ans[k];
    return 0;
}
```
