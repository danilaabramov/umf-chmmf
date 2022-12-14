import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./App.css";
import { Range } from "react-range";

export default function Hello(this: any) {
  const u0 = 0;
  const [l, setL] = useState(20);
  const [T, setT] = useState(100);
  const D = 1.02;
  const [alpha, setAlpha] = useState(0.001);
  const [k, setK] = useState(0.37);
  const [c, setC] = useState(1.42);

  const [epsClick, setEpsClick] = useState(5);
  const [iS, setIS] = useState(1);
  const [ix, setIx] = useState(200);
  const [it, setIt] = useState(200);
  const [state, setState] = useState(2);
  const [stateShod, setStateShod] = useState(false);

  const [tShod, setTShod] = useState(T / 2);
  const [xShod, setXShod] = useState(l / 2);

  const h = useMemo(() => alpha / k, [alpha, k]);

  const a = useMemo(() => Math.sqrt(k / c), [c, k]);

  const psi = (x: number) => Math.cos(Math.PI * x / l) ** 2;
  const psiX = (x: number) => Math.cos(Math.PI * (x + l / 2) / l) ** 2;

  let f = (p: number) => Math.tan(p * l / 2) - h / p;

  const hx = useMemo(() => l / ix, [ix, l]);
  const ht = useMemo(() => T / it, [it, T]);
  const gamma = useMemo(() => a ** 2 * ht / hx ** 2, [ht, hx, a]);

  const colors = ["black", "black", "black", "black", "black"];
  const colors2 = ["blue", "orange", "green", "red", "purple"];

  const W = useMemo(() => {
    let w = JSON.parse(JSON.stringify(Array(it + 1).fill(Array(ix + 1).fill(0))));
    for (let i = 0; i <= ix; ++i) w[0][i] = psiX(i * hx);
    for (let k = 0; k < it; ++k) {
      for (let i = 1; i < ix; ++i) w[k + 1][i] = gamma * (w[k][i + 1] - 2 * w[k][i] + w[k][i - 1]) + w[k][i];
      w[k + 1][0] = (w[k + 1][1] + h * u0 * hx) / (1 + h * hx);
      w[k + 1][ix] = (w[k + 1][ix - 1] + h * u0 * hx) / (h * hx + 1);
    }
    return w;
  }, [it, ix, h, gamma, hx]);

  const W2 = useMemo(() => {
    let pq = Array(it + 1).fill(Array(ix));
    let w = JSON.parse(JSON.stringify(Array(it + 1).fill(Array(ix + 1))));
    for (let i = 0; i <= ix; ++i) w[0][i] = psiX(i * hx);
    for (let K = 1; K <= it; ++K) {
      pq[K][0] = {
        p: 1 / (1 + h * hx),
        q: h * u0 * hx / (1 + h * hx)
      };
      for (let i = 1; i < ix + 1; ++i)
        pq[K][i] = {
          p: gamma / (1 + 2 * gamma - gamma * pq[K][i - 1].p),
          q: (gamma * pq[K][i - 1].q + w[K - 1][i]) / (1 + 2 * gamma - gamma * pq[K][i - 1].p)
        };
      w[K][ix] = (h * u0 * hx - pq[K][ix - 1].q) / (pq[K][ix - 1].p - h * hx - 1);
      for (let i = ix - 1; i >= 0; --i) w[K][i] = w[K][i + 1] * pq[K][i].p + pq[K][i].q;
    }
    return w;
  }, [it, ix, h, gamma, hx]);


  const W3 = useMemo(() => {
    let pq = Array(it + 1).fill(Array(ix));
    let w = JSON.parse(JSON.stringify(Array(it + 1).fill(Array(ix + 1))));
    for (let i = 0; i <= ix; ++i) w[0][i] = psiX(i * hx);
    for (let K = 1; K <= it; ++K) {
      pq[K][0] = {
        p: 1 / (1 + h * hx + (2 * gamma) ** -1),
        q: (u0 * hx * h + w[K - 1][0] * (2 * gamma) ** -1) / (1 + h * hx + (2 * gamma) ** -1)
      };
      for (let i = 1; i < ix + 1; ++i)
        pq[K][i] = {
          p: gamma / (1 + 2 * gamma - gamma * pq[K][i - 1].p),
          q: (gamma * pq[K][i - 1].q + w[K - 1][i]) / (1 + 2 * gamma - gamma * pq[K][i - 1].p)
        };
      w[K][ix] = (pq[K][ix - 1].q + u0 * h * hx + (2 * gamma) ** -1 * w[K - 1][ix])
        / (1 + h * hx + (2 * gamma) ** -1 - pq[K][ix - 1].p);
      for (let i = ix - 1; i >= 0; --i) w[K][i] = w[K][i + 1] * pq[K][i].p + pq[K][i].q;
    }
    return w;
  }, [it, ix, h, gamma, hx]);

  const IKs = useMemo(() => {
    return state === 0 ?
      [{ I: 10, K: 250 }, { I: 20, K: 500 }, { I: 40, K: 1000 }, { I: 80, K: 2000 }, { I: 160, K: 4000 }] :
      state === 1 ?
        [{ I: 10, K: 10 }, { I: 20, K: 20 }, { I: 40, K: 40 }, { I: 80, K: 80 }, { I: 160, K: 160 }] :

        [{ I: 10, K: 10 }, { I: 20, K: 20 }, { I: 40, K: 40 }, { I: 80, K: 80 }, { I: 160, K: 160 }];
  }, [state]);


  const Wshod1 = useMemo(() => {
    let IK = IKs;
    // if (IKs) for (let i = 0; i < IKs.length; ++i) IK.push({ I: IKs[i].I - 1, K: IKs[i].K - 1 });
    let W = [];
    for (let j = 0; j < IK.length; ++j) {
      let hx = l / IK[j].I;
      let ht = T / IK[j].K;
      let gamma = a ** 2 * ht / hx ** 2;
      let w = JSON.parse(JSON.stringify(Array(IK[j].K + 1).fill(Array(IK[j].I + 1).fill(0))));
      for (let i = 0; i <= IK[j].I; ++i) w[0][i] = psiX(i * hx);
      for (let k = 0; k < IK[j].K; ++k) {
        for (let i = 1; i < IK[j].I; ++i) w[k + 1][i] = gamma * (w[k][i + 1] - 2 * w[k][i] + w[k][i - 1]) + w[k][i];
        w[k + 1][0] = (w[k + 1][1] + h * u0 * hx) / (1 + h * hx);
        w[k + 1][IK[j].I] = (w[k + 1][IK[j].I - 1] + h * u0 * hx) / (h * hx + 1);
      }
      W.push(w);
    }
    return W;
  }, [h, gamma, l, T, IKs]);

  const Wshod2 = useMemo(() => {
    let IK = IKs;
    // if (IKs) for (let i = 0; i < IKs.length; ++i) IK.push({ I: IKs[i].I - 1, K: IKs[i].K - 1 });
    let W = [];
    for (let j = 0; j < IK.length; ++j) {
      let hx = l / IK[j].I;
      let ht = T / IK[j].K;
      let gamma = a ** 2 * ht / hx ** 2;
      let pq = Array(IK[j].K + 1).fill(Array(IK[j].I));
      let w = JSON.parse(JSON.stringify(Array(IK[j].K + 1).fill(Array(IK[j].I + 1))));
      for (let i = 0; i <= IK[j].I; ++i) w[0][i] = psiX(i * hx);
      for (let K = 1; K <= IK[j].K; ++K) {
        pq[K][0] = {
          p: 1 / (1 + h * hx),
          q: h * u0 * hx / (1 + h * hx)
        };
        for (let i = 1; i < IK[j].I + 1; ++i)
          pq[K][i] = {
            p: gamma / (1 + 2 * gamma - gamma * pq[K][i - 1].p),
            q: (gamma * pq[K][i - 1].q + w[K - 1][i]) / (1 + 2 * gamma - gamma * pq[K][i - 1].p)
          };
        w[K][IK[j].I] = (h * u0 * hx - pq[K][IK[j].I - 1].q) / (pq[K][IK[j].I - 1].p - h * hx - 1);
        for (let i = IK[j].I - 1; i >= 0; --i) w[K][i] = w[K][i + 1] * pq[K][i].p + pq[K][i].q;
      }
      W.push(w);
    }
    return W;
  }, [h, gamma, l, T, IKs]);

  const Wshod3 = useMemo(() => {
    let IK = IKs;
    // if (IKs) for (let i = 0; i < IKs.length; ++i) IK.push({ I: IKs[i].I - 1, K: IKs[i].K - 1 });
    let W = [];
    for (let j = 0; j < IK.length; ++j) {
      let hx = l / IK[j].I;
      let ht = T / IK[j].K;
      let gamma = a ** 2 * ht / hx ** 2;
      let pq = Array(IK[j].K + 1).fill(Array(IK[j].I));
      let w = JSON.parse(JSON.stringify(Array(IK[j].K + 1).fill(Array(IK[j].I + 1))));
      for (let i = 0; i <= IK[j].I; ++i) w[0][i] = psiX(i * hx);
      for (let K = 1; K <= IK[j].K; ++K) {
        pq[K][0] = {
          p: 1 / (1 + h * hx + (2 * gamma) ** -1),
          q: (u0 * hx * h + w[K - 1][0] * (2 * gamma) ** -1) / (1 + h * hx + (2 * gamma) ** -1)
        };
        for (let i = 1; i < IK[j].I + 1; ++i)
          pq[K][i] = {
            p: gamma / (1 + 2 * gamma - gamma * pq[K][i - 1].p),
            q: (gamma * pq[K][i - 1].q + w[K - 1][i]) / (1 + 2 * gamma - gamma * pq[K][i - 1].p)
          };
        w[K][IK[j].I] = (pq[K][IK[j].I - 1].q + u0 * h * hx + (2 * gamma) ** -1 * w[K - 1][IK[j].I])
          / (1 + h * hx + (2 * gamma) ** -1 - pq[K][IK[j].I - 1].p);
        for (let i = IK[j].I - 1; i >= 0; --i) w[K][i] = w[K][i + 1] * pq[K][i].p + pq[K][i].q;
      }
      W.push(w);
    }
    return W;
  }, [h, gamma, l, T, IKs]);

  useEffect(() => {
    if (T < tShod) setTShod(T);
  }, [T]);

  useEffect(() => {
    if (l / 2 < xShod) setXShod(l / 2);
  }, [l]);

  const arrShod = useMemo(() => {
    let IK = IKs;
    //for (let i = 0; i < IKs.length; ++i) IK.push({ I: IKs[i].I - 1, K: IKs[i].K - 1 });

    let arr: any[] = [];

    const ts = T < tShod ? T : tShod;

    for (let j = 0; j < IK.length; ++j) {

      let t = (IK[j].K * ts / T).toFixed(0);
      let hx = l / IK[j].I;
      let data: any[] = [];
      //console.log( Wshod3[j][0][11])
      for (let i = 0, x = 0; i <= IK[j].I; ++i, x += hx) {
        data = [...data, {
          x: Number(x.toFixed(2)),
          v: (state === 1 ? Wshod2[j][t][i] : state === 2 ? Wshod3[j][t][i] : Wshod1[j][t][i])//state === 0 ? W[Number((W.length / 2).toFixed(1))][i] : state === 1 ? W2[tt[j]][i] : W2[tt[j]][i]
        }];
      }
      arr = [...arr, { name: "I = " + IKs[j].I + "; K = " + IKs[j].K, data, color: colors2[j] }];
    }
    return arr;
  }, [Wshod1, Wshod2, Wshod3, state, tShod]);

  const arrShod2 = useMemo(() => {
    let IK = IKs;
    //for (let i = 0; i < IKs.length; ++i) IK.push({ I: IKs[i].I - 1, K: IKs[i].K - 1 });

    let arr: any[] = [];

    const xs = l < xShod ? l : xShod;

    for (let j = 0; j < IK.length; ++j) {

      let x = Number((IK[j].I * xs / l - IK[j].I / 2).toFixed(0));
      if(x < 0) x += IK[j].I
      let ht = (T - 1) / IK[j].K;
      let data: any[] = [];
      for (let k = 0, t = 1; k <= IK[j].K; ++k, t += ht) {
        data = [...data, {
          t: Number(t.toFixed(2)),
          v: (state === 1 ? Wshod2[j][k][x] : state === 2 ? Wshod3[j][k][x] : Wshod1[j][k][x])//state === 0 ? W[Number((W.length / 2).toFixed(1))][i] : state === 1 ? W2[tt[j]][i] : W2[tt[j]][i]
        }];
      }
      arr = [...arr, { name: "I = " + IKs[j].I + "; K = " + IKs[j].K, data, color: colors2[j] }];
    }
    return arr;
  }, [Wshod1, Wshod2, Wshod3, state, xShod]);


  const eps = 0.0001;
  const delta = eps / 6;
  const pn = (a: number, b: number) => {
    let x1, x2;
    while (eps < Math.abs(b - a)) {
      x1 = (a + b) / 2 - delta;
      x2 = (a + b) / 2 + delta;
      if (f(x1) < 0 && f(x2) < 0) a = x1;
      else if (f(x1) > 0 && f(x2) > 0) b = x2;
      else {
        a = x1;
        b = x2;
      }
    }
    return (a + b) / 2;
  };

  const [Nmin, setNmin] = useState(0);

  const p = useMemo(() => {
    let pns = [];
    for (let n = 0; n < iS || n < Nmin; ++n) pns.push(pn(Math.PI / l * 2 * n, Math.PI / l * (2 * n + 1)));
    return pns;
  }, [Nmin, iS, h, l]);

  const hl = l / 1000;
  const I = (n: number) => {
    let answer = 0;
    let P = p[n];
    for (let x = 0; x < l / 2; x += hl)
      answer += (psi(x) - u0) * Math.cos(P * x) * hl;
    return answer;
  };

  const A = useMemo(() => {
    let Ans = [];
    for (let n = 0; n < iS || n < Nmin; ++n) Ans.push(I(n) / (l / 4 + h / (2 * (p[n] ** 2 + h ** 2))));
    return Ans;
  }, [p, l]);

  const Sum = (is: number, x: number = 1, t: number = 1) => {
    let answer = 0;
    for (let n = 0; n < is; ++n) {
      let P = p[n];
      answer += A[n] * Math.exp(-(a ** 2) * P ** 2 * t) * Math.cos(P * x);
    }
    return answer;
  };

  const [flag, setFlag] = useState(true);

  const F = (N: number) => l ** 3 * h * D / 6 / Math.PI ** 2 / (N - 1) ** 3;

  const N = useMemo(() => {
    let Ns = [];
    let n = 0;
    for (let e = 10 ** -2; e >= 10 ** -10; e /= 10) {
      let Nt = 2;
      for (; e <= F(Nt); ++Nt) ;
      setNmin(--Nt);
      for (n = 1; Math.abs(Sum(Nt) - Sum(Nt - n)) <= e; ++n) ;
      Ns.push({ Ne: Nt - n + 1, Nt });
    }
    if (flag) setIS(n + 1);
    setFlag(false);
    return Ns;
  }, [a, p, l]);

  const arrAnal = useMemo(() => {
    const t = tShod;
    let arr: any[] = [];

    let data: any[] = [];
    for (let j = 0, x = -l / 2; j <= ix; x += hx, ++j)
      data = [...data, { x: Number((x + l / 2).toFixed(2)), v: Number(Sum(iS, x, t)) }];
    arr = [...arr, { name: "Аналитика", data, color: "black" }];

    return arr;
  }, [ix, p, a, l, T, tShod]);

  const arrAnal2 = useMemo(() => {
    let x = xShod;
    if(x > l / 2) {
      x -= l
      x = -x
    }
    let arr: any[] = [];

    let data: any[] = [];
    for (let t = 1, k = 0; k <= it; ++k, t += (T - 1) / it)
      data = [...data, { t: Number(t.toFixed(2)), v: Number(Sum(iS, x, t)) }];
    arr = [...arr, { name: "Аналитика", data, color: "black" }];

    return arr;
  }, [ix, p, a, l, T, xShod]);


  const arr1 = useMemo(() => {
    const t = [T / 20, T / 10, T / 5, T / 2, T];
    let arr: any[] = [];
    for (let i = 0; i < 5; ++i) {
      let data: any[] = [];
      for (let j = 0, x = -l / 2; j <= ix; x += hx, ++j)
        data = [...data, { x: Number((x + l / 2).toFixed(2)), v: Number(Sum(iS, x, t[i])) }];
      arr = [...arr, { name: "t = " + t[i].toFixed(2), data, color: colors[i] }];
    }
    return arr;
  }, [ix, p, a, l, T]);

  const arr12 = useMemo(() => {
    const t = [T * 0.05, T * 0.1, T * 0.2, T * 0.5, T];
    const tt = [(it * 0.05).toFixed(0), (it * 0.1).toFixed(0), (it * 0.2).toFixed(0), (it * 0.5).toFixed(0), it];

    let arr: any[] = [];

    for (let j = 0; j < 5; ++j) {
      let data: any[] = [];
      for (let i = 0, x = 0; i <= ix; ++i, x += hx)
        data = [...data, {
          x: Number(x.toFixed(2)),
          v: state === 0 ? W[tt[j]][i] : state === 1 ? W2[tt[j]][i] : W3[tt[j]][i]
        }];
      arr = [...arr, { name: "t* = " + t[j].toFixed(2), data, color: colors2[j] }];
    }
    return arr;
  }, [ix, it, p, a, state, l, T]);


  const arr2 = useMemo(() => {

    const y = [0, l * 0.125, l * 0.25, l * 0.375, l * 0.5];
    let arr: any[] = [];
    for (let i = 0; i < 5; ++i) {
      let data: any[] = [];
      for (let t = 1, k = 0; k <= it; ++k, t += (T - 1) / it)
        data = [...data, { t: Number(t.toFixed(2)), v: Number(Sum(iS, y[i], t)) }];
      arr = [...arr, { name: "y = " + y[i].toFixed(2), data, color: colors[i] }];
    }
    return arr;
  }, [it, p, a, l, T]);


  const arr22 = useMemo(() => {
    const y = [0, l * 0.125, l * 0.25, l * 0.375, l * 0.5];
    const x = [(ix * 0.5).toFixed(0), (ix * 0.375).toFixed(0), (ix * 0.25).toFixed(0), (ix * 0.125).toFixed(0), 0];
    let arr: any[] = [];
    for (let i = 0; i < 5; ++i) {
      let data: any[] = [];
      for (let k = 0, t = 1; k <= it; ++k, t += (T - 1) / it)
        data = [...data, {
          t: Number(t.toFixed(2)),
          v: state === 0 ? W[k][x[i]] : state === 1 ? W2[k][x[i]] : W3[k][x[i]]
        }];
      arr = [...arr, { name: "y* = " + y[i].toFixed(2), data, color: colors2[i] }];
    }
    return arr;
  }, [ix, it, p, a, state, l, T]);


  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    setInterval(() => {
      setWidth(window.innerWidth);
    }, 0.1);
  });

  const [activeP, setActiveP] = useState(false);
  const [activeN, setActiveN] = useState(false);


  const [zoom, setZoom] = useState([80]);
  //const [zoom2, setZoom2] = useState([50]);

  const [domains, setDomains] = useState([0, l, 0, 1]);
  const [domains2, setDomains2] = useState([1, T, 0, 1]);

  const zoomFun = (d1: number, d2: number, data: any[]) => {
    let arr = [];
    let flag1 = true;
    let flag2 = true;
    for (let i = 0; i < data.length; ++i)
      if (d1 <= data[i].x && data[i].x <= d2) {
        if (i > 0 && flag1) {
          arr.push({
            x: d1,
            v: (data[i].v - data[i - 1].v) * (d1 - data[i - 1].x) / (data[i].x - data[i - 1].x) + data[i - 1].v
          });
          flag1 = false;
        }
        arr.push(data[i]);
      } else if (!flag1 && flag2 && i < data.length - 1) {
        arr.push({
          x: d2,
          v: (data[i].v - data[i - 1].v) * (d2 - data[i - 1].x) / (data[i].x - data[i - 1].x) + data[i - 1].v
        });
        break;
      }

    return arr;
  };

  const zoomFun2 = (d1: number, d2: number, data: any[]) => {
    let arr = [];
    let flag1 = true;
    let flag2 = true;
    for (let i = 0; i < data.length; ++i)
      if (d1 <= data[i].t && data[i].t <= d2) {
        if (i > 0 && flag1) {
          if (d1 > 1)
          arr.push({
            t: d1,
            v: (data[i].v - data[i - 1].v) * (d1 - data[i - 1].t) / (data[i].t - data[i - 1].t) + data[i - 1].v
          });
          flag1 = false;
        }
        arr.push(data[i]);
      } else if (!flag1 && flag2 && i < data.length - 1) {
        arr.push({
          t: d2,
          v: (data[i].v - data[i - 1].v) * (d2 - data[i - 1].t) / (data[i].t - data[i - 1].t) + data[i - 1].v
        });
        break;
      }

    return arr;
  };

  const [arrZoom, setArrZoom] = useState([...arrShod, ...arrAnal]);
  const [arrZoom2, setArrZoom2] = useState([...arrShod2, ...arrAnal2]);

  useEffect(() => {
    const d1 = zoom[0] * l / 200;
    const d2 = l - d1;
    const d3 = zoom[0] / 100;
    const d4 = 1 - d3;
    setDomains([d1, d2, d3, d4]);


    const as0 = zoomFun(d1, d2, arrShod[0].data);
    const as1 = zoomFun(d1, d2, arrShod[1].data);
    const as2 = zoomFun(d1, d2, arrShod[2].data);
    const as3 = zoomFun(d1, d2, arrShod[3].data);
    const as4 = zoomFun(d1, d2, arrShod[4].data);
    const aa = zoomFun(d1, d2, arrAnal[0].data);

    const data = [
      { ...arrShod[0], data: as0 },
      { ...arrShod[1], data: as1 },
      { ...arrShod[2], data: as2 },
      { ...arrShod[3], data: as3 },
      { ...arrShod[4], data: as4 },
      { ...arrAnal[0], data: aa }
    ];
    setArrZoom(data);

  }, [zoom[0], ...arrShod, ...arrAnal]);

  useEffect(() => {
    const d1 = zoom[0] * T / 200;
    const d2 = T - d1;
    const d3 = zoom[0] / 200;
    const d4 = 1 - d3;
    setDomains2([d1, d2, d3, d4]);


    const as0 = zoomFun2(d1, d2, arrShod2[0].data);
    const as1 = zoomFun2(d1, d2, arrShod2[1].data);
    const as2 = zoomFun2(d1, d2, arrShod2[2].data);
    const as3 = zoomFun2(d1, d2, arrShod2[3].data);
    const as4 = zoomFun2(d1, d2, arrShod2[4].data);
    const aa = zoomFun2(d1, d2, arrAnal2[0].data);

    const data = [
      { ...arrShod2[0], data: as0 },
      { ...arrShod2[1], data: as1 },
      { ...arrShod2[2], data: as2 },
      { ...arrShod2[3], data: as3 },
      { ...arrShod2[4], data: as4 },
      { ...arrAnal2[0], data: aa }
    ];
    setArrZoom2(data);

  }, [zoom[0], ...arrShod2, ...arrAnal2]);
  return (
    <>
      <div className="main">
        <div>
          {
            !stateShod &&
            <div>
              <div style={{ width: width / 2, fontSize: "14px" }}>
                <h3 style={{ color: "#000", margin: "0 0 20px 50px" }}>Графики температуры стержня с теплоизолированной
                  боковой поверхностью</h3>
                <h4 style={{ position: "absolute", transform: "translate(0px, -10px)" }}>w(x, t)</h4>
                <ComposedChart
                  width={width / 2}
                  height={300}
                  margin={{
                    right: 15
                  }}
                >
                  <CartesianGrid stroke="#BFBEBE" />
                  <XAxis domain={[0, l]} type="number" dataKey="x" allowDuplicatedCategory={false} />
                  <YAxis domain={[0, 1]} />
                  <Legend />
                  <Tooltip />
                  {[...arr1, ...arr12].map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name} key={i.name}
                                                        strokeWidth={2}
                                                        stroke={i.color} />)}
                </ComposedChart>
                <h4 style={{ position: "absolute", transform: `translate(${width / 2 - 10}px, -60px)` }}>x</h4>
              </div>
              <div style={{ width: width / 2, fontSize: "14px" }}>
                <h4 style={{ position: "absolute", transform: "translate(0px, -10px)" }}>w(y, t)</h4>
                <ComposedChart
                  width={width / 2}
                  height={300}
                  margin={{
                    top: 10,
                    right: 15
                  }}>
                  <CartesianGrid stroke="#BFBEBE" />
                  <XAxis domain={[0, T]} type="number" dataKey="t" allowDuplicatedCategory={false} />
                  <YAxis domain={[0, 1]} />
                  <Legend />
                  <Tooltip />
                  {[...arr2, ...arr22].map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name} key={i.name}
                                                        strokeWidth={2}
                                                        stroke={i.color} />)}
                </ComposedChart>
                <h4
                  style={{
                    position: "absolute",
                    transform: `translate(${width / 2 - 10}px, -60px)`
                  }}
                >t</h4>
              </div>
            </div>
          }


          {/* ///////////////// */}
          {
            stateShod &&
            <div style={{ width: width / 2, fontSize: "14px" }}>
              <div style={{ height: 30 }}></div>

              <Range
                step={0.1}
                min={0}
                max={100}
                values={zoom}
                onChange={(values) => setZoom(values)}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "6px",
                      width: "100%",
                      backgroundColor: "#ccc"
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "42px",
                      width: "42px",
                      backgroundColor: "#999"
                    }}
                  />
                )}
              />

              <div style={{ height: 30 }}></div>

              <div style={{ display: "flex" }}>
                <div className="inputName">t</div>
                <input
                  type="number"
                  placeholder={String(tShod)}
                  className="writeInput"
                  onChange={e => e.target.value === "" ? setTShod(Number((T / 2).toFixed(0))) : Number(e.target.value) <= T && Number(e.target.value) > 0 ? setTShod(Number(e.target.value)) : Number(e.target.value) <= 0 ? setTShod(0) : setTShod(T)}
                  min={0}
                />
              </div>

              <div style={{ height: 30 }}></div>

              <h4 style={{ position: "absolute", transform: "translate(0px, -35px)" }}>{`w(x, t=${tShod})`}</h4>

              <ComposedChart
                width={width / 2}
                height={300}
                margin={{
                  right: 15,
                  left: 100
                }}
              >
                <CartesianGrid stroke="#BFBEBE" />
                <XAxis domain={[domains[0], domains[1]]} type="number" dataKey="x" allowDuplicatedCategory={false} />
                <YAxis domain={[domains[2], domains[3]]} />
                <Legend />
                <Tooltip />
                {[...arrZoom].map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name}
                                               key={i.name}
                                               strokeWidth={2}
                                               stroke={i.color} />)}
              </ComposedChart>


              <h4 style={{ position: "absolute", transform: `translate(${width / 2 - 10}px, -60px)` }}>x</h4>

              <div style={{ height: 30 }}></div>

              <div style={{ display: "flex" }}>
                <div className="inputName">y</div>
                <input
                  type="number"
                  placeholder={String(xShod)}
                  className="writeInput"
                  onChange={e => e.target.value === "" ? setXShod(Number((l / 2).toFixed(0))) : Number(e.target.value) <= l / 2 && Number(e.target.value) > 0 ? setXShod(Number(e.target.value)) : Number(e.target.value) <= 0 ? setXShod(0) : setXShod(l / 2)}
                  min={0}
                />
              </div>

              <div style={{ height: 30 }}></div>

              <h4 style={{ position: "absolute", transform: "translate(0px, -35px)" }}>{`w(y=${xShod}, t)`}</h4>

              <ComposedChart
                width={width / 2}
                height={300}
                margin={{
                  top: 10,
                  right: 15,
                  left: 100
                }}>
                <CartesianGrid stroke="#BFBEBE" />
                <XAxis domain={[domains2[0], domains2[1]]} type="number" dataKey="t" allowDuplicatedCategory={false} />
                <YAxis domain={[domains2[2], domains2[3]]} />
                <Legend />
                <Tooltip />
                {[...arrZoom2].map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name} key={i.name}
                                                strokeWidth={2}
                                                stroke={i.color} />)}
              </ComposedChart>
              <h4
                style={{
                  position: "absolute",
                  transform: `translate(${width / 2 - 10}px, -60px)`
                }}
              >t</h4>
            </div>


          }
          {/* //////////////// */}


          <div style={{ height: 50 }}></div>

        </div>
        <div style={{ marginLeft: 20 }}>
          <div className="writeInput hover" style={{
            color: "#000",
            marginBottom: 20,
            cursor: "pointer",
            width: "calc((100% - 40px))",
            marginRight: "calc((100% - 20px) / 20)",
            textAlign: "center",
            backgroundColor: stateShod ? "#499BD4" : ""
          }}
               onClick={() => setStateShod(s => !s)}>Cходимость
          </div>
          <div style={{ display: "flex", width: "calc(100% - 20px)" }}>
            <div className="writeInput hover" style={{
              color: "#000",
              margin: 0,
              cursor: "pointer",
              width: "calc((100% - 20px) / 2.125)",
              marginRight: "calc((100% - 20px) / 20)",
              textAlign: "center"
            }}
                 onClick={() => setActiveP(true)}>Таблица p(n)
            </div>
            <div className="writeInput hover" style={{
              color: "#000",
              margin: 0,
              cursor: "pointer",
              width: "calc((100% - 20px) / 2.125)",
              textAlign: "center"
            }}
                 onClick={() => setActiveN(true)}>Таблица N
            </div>
          </div>

          {/* <div className="inputName" style={{ marginTop: 20 }}>Количество итераций вычисления суммы ряда</div> */}
          {/* <input */}
          {/*   type="number" */}
          {/*   placeholder="6" */}
          {/*   className="writeInput" */}
          {/*   onChange={e => e.target.value === "" ? setIS(6) : Number(e.target.value) <= 100 ? setIS(Number(e.target.value)) : setIS(100)} */}
          {/*   min={0} */}
          {/*   max={100} */}
          {/* /> */}

          <div className="inputName" style={{ marginTop: 20 }}>Необходимая точность ε: 10<sup>{-epsClick - 2}</sup>
          </div>
          <div style={{ display: "flex", width: "calc(100% - 20px)" }}>
            {
              N.map((_it, i) => {
                return (
                  <div onClick={() => {
                    setIS(N[i].Ne);
                    setEpsClick(i);
                  }} className="writeInput hover" style={{
                    width: "calc((100% - 20px) / 6 - 2px)",
                    margin: "0 1px",
                    fontSize: 14,
                    cursor: "pointer"
                  }}>
                    10<sup>{-i - 2}</sup>
                  </div>
                );
              })
            }
          </div>

          <div style={{ display: "flex" }}>
            <div style={{
              minWidth: 20,
              height: 20,
              margin: 5,
              background: state === 0 ? "blue" : "gray",
              borderRadius: 10,
              cursor: "pointer"
            }} onClick={() => setState(0)} />
            <div style={{ marginTop: 5 }}>Простейшая явная конечно-разностная схема</div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{
              minWidth: 20,
              height: 20,
              margin: 5,
              background: state === 1 ? "blue" : "gray",
              borderRadius: 10,
              cursor: "pointer"
            }} onClick={() => setState(1)} />
            <div style={{ marginTop: 5 }}>Простейшая неявная конечно-разностная схема</div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{
              minWidth: 20,
              height: 20,
              margin: 5,
              background: state === 2 ? "blue" : "gray",
              borderRadius: 10,
              cursor: "pointer"
            }} onClick={() => setState(2)} />
            <div style={{ marginTop: 5 }}>Модифицированная простейшая неявная конечно-разностная схема</div>
          </div>
          {
            !stateShod &&
            <div>
              <div className="inputName">I</div>
              <input
                type="number"
                placeholder="200"
                className="writeInput"
                onChange={e => e.target.value === "" ? setIx(200) : Number(e.target.value) <= 10000 && Number(e.target.value) > 0 ? setIx(Number(e.target.value)) : Number(e.target.value) <= 0 ? setIx(1) : setIx(10000)}
                min={1}
                max={1000}
              />
              <div className="inputName">K</div>
              <input
                type="number"
                placeholder="200"
                className="writeInput"
                onChange={e => e.target.value === "" ? setIt(200) : Number(e.target.value) <= 10000 && Number(e.target.value) > 0 ? setIt(Number(e.target.value)) : Number(e.target.value) <= 0 ? setIt(1) : setIt(10000)}
                min={1}
                max={1000}
              />
            </div>
          }
          <div className="inputName">T</div>
          <input
            type="number"
            placeholder="100"
            className="writeInput"
            onChange={e => e.target.value === "" ? setT(100) : Number(e.target.value) > 0 ? setT(Number(e.target.value)) : setT(1)}
            min={1}
          />

          <div className="inputName">l (длина стержня)</div>
          <input
            type="number"
            placeholder="20"
            className="writeInput"
            onChange={e => e.target.value === "" ? setL(20) : Number(e.target.value) > 0 ? setL(Number(e.target.value)) : setL(1)}
            min={1}
          />
          <div className="inputName">α</div>
          <input
            type="number"
            placeholder="0.001"
            className="writeInput"
            onChange={e => e.target.value === "" ? setAlpha(0.001) : setAlpha(Number(e.target.value))}
            step={0.001}
          />
          <div className="inputName">k</div>
          <input
            type="number"
            placeholder="0.37"
            className="writeInput"
            onChange={e => e.target.value === "" || Number(e.target.value) === 0 ? setK(0.37) : setK(Number(e.target.value))}
            step={0.01}
          />
          <div className="inputName">c</div>
          <input
            type="number"
            placeholder="1.42"
            className="writeInput"
            onChange={e => e.target.value === "" || Number(e.target.value) === 0 ? setC(1.42) : setC(Number(e.target.value))}
            step={0.01}
          />

        </div>
      </div>
      <div style={{
        width: activeP ? "calc((50% - 430px) / 2 + 395px)" : 0,
        minWidth: activeP ? 400 : 0,
        height: "100vh",
        position: "absolute",
        top: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        boxShadow: "0 0 35px rgba(0, 0, 0, 0.1)",
        overflow: "scroll",
        transition: ".5s"
      }}>
        <div className="btn" onClick={() => {
          setActiveN(false);
          setActiveP(false);
        }} style={{
          opacity: activeP ? 1 : 0,
          transition: ".5s"
        }}>{"x"}</div>
        <div style={{ marginTop: 50, justifyContent: "center" }}>
          <div className="writeInput" style={{ display: "flex", margin: 10 }}>
            <div style={{ textAlign: "center", width: 40 }}>n</div>
            <div style={{ textAlign: "center", width: 240, marginLeft: 40 }}>p(n)</div>
          </div>
          {
            p.map((it: number, i: number) => {
              return (
                <div className="writeInput" style={{ display: "flex", margin: 10 }} key={i}>
                  <div style={{ textAlign: "center", width: 40 }}>{i + 1}</div>
                  <div style={{ textAlign: "center", width: 240, marginLeft: 40 }}>{it}</div>
                </div>
              );
            })
          }
        </div>
      </div>
      <div style={{
        width: activeN ? "calc((50% - 430px) / 2 + 395px)" : 0,
        minWidth: activeN ? 400 : 0,
        height: "100vh",
        position: "absolute",
        top: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        boxShadow: "0 0 35px rgba(0, 0, 0, 0.1)",
        overflow: "scroll",
        transition: ".5s"
      }}>
        <div className="btn" onClick={() => {
          setActiveN(false);
          setActiveP(false);
        }} style={{
          opacity: activeN ? 1 : 0,
          transition: ".5s"
        }}>{"x"}</div>
        <div style={{ marginTop: 50, justifyContent: "center" }}>

          <div className="writeInput" style={{ display: "flex", margin: 10 }}>
            <div style={{ textAlign: "center", width: 93 }}>ε</div>
            <div style={{ textAlign: "center", width: 93, marginLeft: 40 }}>Nт</div>
            <div style={{ textAlign: "center", width: 93, marginLeft: 40 }}>Nэ</div>
          </div>
          {
            N.map((it, i: number) => {
              return (
                <div className="writeInput" style={{ display: "flex", margin: 10 }} key={i}>
                  <div style={{ textAlign: "center", width: 93 }}>10<sup>{-i - 2}</sup></div>
                  <div style={{ textAlign: "center", width: 93, marginLeft: 40 }}>{it.Nt}</div>
                  <div style={{ textAlign: "center", width: 93, marginLeft: 40 }}>{it.Ne}</div>
                </div>
              );
            })
          }
          {W3.map(() => {
          })}
        </div>
      </div>
    </>
  );
}
