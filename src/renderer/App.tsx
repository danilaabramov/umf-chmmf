import { useEffect, useState, useMemo } from "react";
import { CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis, Legend } from "recharts";
import "./App.css";

export default function Hello() {

  const u0 = 0;
  const l = 20;
  const T = 100;
  const D = 1.02;
  const [alpha, setAlpha] = useState(0.001);
  const [k, setK] = useState(0.37);
  const [c, setC] = useState(1.42);

  const [epsClick, setEpsClick] = useState(5);

  const h = useMemo(() => {
    return alpha / k;
  }, [alpha, k]);

  const a = useMemo(() => {
    return Math.sqrt(k / c);
  }, [c, k]);

  const [iS, setIS] = useState(1);
  const [ix, setIx] = useState(100);
  const [it, setIt] = useState(100);

  const psi = (x: number) => {
    return Math.cos(Math.PI * x / l) ** 2;
  };

  let f = (p: number) => {
    return Math.tan(p * l / 2) - h / p;
  };

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
    console.log(pns.length);
    return pns;
  }, [Nmin, iS, h]);


  const hl = l / 1000;
  const I = (n: number) => {
    let answer = 0;
    let P = p[n];
    for (let i = 0; i < l / 2; i += hl)
      answer += (psi(i) - u0) * Math.cos(P * i) * hl;
    return answer;
  };

  const A = useMemo(() => {
    let Ans = [];
    for (let n = 0; n < iS || n < Nmin; ++n) Ans.push(I(n) / (l / 4 + h / (2 * (p[n] ** 2 + h ** 2))));
    return Ans;
  }, [p]);


  const Sum = (is: number, x: number = 1, t: number = 1) => {
    console.log(is);
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
    for (let e = 10 ** -2; e >= 10 ** -7; e /= 10) {
      let Nt = 2;
      for (; e <= F(Nt); ++Nt);
      setNmin(--Nt);
      for (n = 1; Math.abs(Sum(Nt) - Sum(Nt - n)) <= e; ++n);
      Ns.push({ Ne: Nt - n + 1, Nt });
    }
    if (flag) setIS(n + 1);
    setFlag(false)
    return Ns;
  }, [a, p]);

  const colors = ["#4589BD", "#F39839", "#5AA94A", "#CF4B3E", "#A080C4"];

  const arr = useMemo(() => {
    const t = [5, 10, 20, 50, 100];
    let arr: any[] = [];
    for (let i = 0; i < 5; ++i) {
      let data: any[] = [];
      for (let x = -l / 2; x <= 0; x += l / ix)
        data = [...data, { x: Number((x + l / 2).toFixed(2)), v: Number(Sum(iS, x, t[i])) }];
      data = [...data, ...data.reverse().map((item, index) => {
        return { x: Number((l / 2 + index * l / 2 / (data.length - 1)).toFixed(2)), v: item.v };
      })];

      arr = [...arr, { name: "t = " + t[i], data, color: colors[i] }];
    }

    return arr;
  }, [ix, p, a]);

  const arr2 = useMemo(() => {
    const x = [1, 3, 5, 8, 10];
    let arr: any[] = [];
    for (let i = 0; i < 5; ++i) {
      let data: any[] = [];
      for (let t = 1; t <= T; t += (T - 1) / it)
        data = [...data, { t: Number(t.toFixed(2)), v: Number(Sum(iS, x[i], t)) }];
      arr = [...arr, { name: "y = " + x[i], data, color: colors[i] }];
    }
    return arr;
  }, [it, p, a]);


  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    setInterval(() => {
      setWidth(window.innerWidth);
    }, 0.1);
  });

  const [activeP, setActiveP] = useState(false);
  const [activeN, setActiveN] = useState(false);

  return (
    <>
      <div className="main">
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
              }}>
              <CartesianGrid stroke="#BFBEBE" />
              <XAxis dataKey="x" allowDuplicatedCategory={false} interval={4} />
              <YAxis domain={[0, 1]} />
              <Legend />
              <Tooltip />
              {arr.map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name} key={i.name} strokeWidth={2}
                                    stroke={i.color} />)}
            </ComposedChart>
            <h4 style={{ position: "absolute", transform: `translate(${width / 2 - 10}px, -25px)` }}>x</h4>
          </div>
          <div style={{ width: width / 2, fontSize: "14px" }}>
            <h4 style={{ position: "absolute", transform: "translate(0px, -10px)" }}>w(y, t)</h4>
            <ComposedChart
              width={width / 2}
              height={300}
              data={arr2}
              margin={{
                top: 10,
                right: 15
              }}>
              <CartesianGrid stroke="#BFBEBE" />
              <XAxis dataKey="t" allowDuplicatedCategory={false} interval={6} />
              <YAxis domain={[0, 1]} />
              <Legend />
              <Tooltip />
              {arr2.map((i) => <Line dot={false} dataKey="v" data={i.data} name={i.name} key={i.name} strokeWidth={2}
                                     stroke={i.color} />)}
            </ComposedChart>
            <h4 style={{ position: "absolute", transform: `translate(${width / 2 - 10}px, -25px)` }}>t</h4>
          </div>
        </div>
        <div style={{ marginLeft: 20 }}>
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
          <div className="inputName">Количество интервалов разбиения по x</div>
          <input
            type="number"
            placeholder="100"
            className="writeInput"
            onChange={e => e.target.value === "" ? setIx(100) : Number(e.target.value) <= 100 ? setIx(Number(e.target.value)) : setIx(100)}
            min={0}
            max={100}
          />
          <div className="inputName">Количество интервалов разбиения по t</div>
          <input
            type="number"
            placeholder="100"
            className="writeInput"
            onChange={e => e.target.value === "" ? setIt(100) : Number(e.target.value) <= 100 ? setIt(Number(e.target.value)) : setIt(100)}
            min={0}
            max={100}
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
        </div>
      </div>
    </>
  );
}
