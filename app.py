"""
╔══════════════════════════════════════════════════════════╗
║          LOAN SIMULATOR  —  Premium Dashboard            ║
║   Streamlit + Plotly  |  Dark Financial Terminal Theme   ║
╚══════════════════════════════════════════════════════════╝
Run:  streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go

# ─────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────
st.set_page_config(
    page_title="Loan Simulator",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────
#  DESIGN TOKENS  (dark financial terminal)
# ─────────────────────────────────────────
C = dict(
    bg      = "#0a0e1a",
    surface = "#111827",
    card    = "#141d2e",
    border  = "#1e2d45",
    accent  = "#38bdf8",
    accent2 = "#34d399",
    accent3 = "#f59e0b",
    accent4 = "#f87171",
    text    = "#e2e8f0",
    muted   = "#64748b",
    line1   = "#38bdf8",
    line2   = "#34d399",
    fill1   = "rgba(56,189,248,0.10)",
    fill2   = "rgba(52,211,153,0.10)",
    arrow   = "#fbbf24",
)

PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor ="rgba(0,0,0,0)",
    font=dict(family="'DM Mono', monospace", color=C["text"], size=11),
    margin=dict(l=55, r=30, t=55, b=45),
    xaxis=dict(gridcolor=C["border"], zerolinecolor=C["border"],
               tickfont=dict(color=C["muted"]), linecolor=C["border"]),
    yaxis=dict(gridcolor=C["border"], zerolinecolor=C["border"],
               tickfont=dict(color=C["muted"]), linecolor=C["border"]),
    legend=dict(bgcolor="rgba(20,29,46,0.9)", bordercolor=C["border"],
                borderwidth=1, font=dict(size=11, color=C["text"])),
    hoverlabel=dict(bgcolor=C["surface"], bordercolor=C["accent"],
                    font=dict(family="'DM Mono', monospace", color=C["text"], size=11)),
    hovermode="x unified",
)

# ─────────────────────────────────────────
#  GLOBAL CSS
# ─────────────────────────────────────────
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

*, *::before, *::after {{ box-sizing: border-box; }}
html, body, [class*="css"] {{
    font-family: 'DM Mono', monospace;
    background: {C['bg']};
    color: {C['text']};
}}
.stApp {{ background: {C['bg']}; }}
.block-container {{ padding: 2rem 2.5rem 4rem; max-width: 1440px; }}

/* sidebar */
section[data-testid="stSidebar"] {{
    background: {C['surface']} !important;
    border-right: 1px solid {C['border']};
}}
section[data-testid="stSidebar"] label,
section[data-testid="stSidebar"] p,
section[data-testid="stSidebar"] span,
section[data-testid="stSidebar"] div {{
    color: {C['text']} !important;
}}

/* metric cards */
div[data-testid="metric-container"] {{
    background: {C['card']};
    border: 1px solid {C['border']};
    border-radius: 14px;
    padding: 20px 24px 18px;
    transition: border-color .25s, box-shadow .25s;
}}
div[data-testid="metric-container"]:hover {{
    border-color: {C['accent']}55;
    box-shadow: 0 0 20px {C['accent']}12;
}}
div[data-testid="metric-container"] label {{
    color: {C['muted']} !important;
    font-size: 0.66rem !important;
    letter-spacing: .14em;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace !important;
}}
div[data-testid="metric-container"] [data-testid="stMetricValue"] {{
    color: {C['text']} !important;
    font-family: 'Syne', sans-serif !important;
    font-size: 1.8rem !important;
    font-weight: 700 !important;
    letter-spacing: -.03em;
}}
div[data-testid="metric-container"] [data-testid="stMetricDelta"] span {{
    font-size: 0.72rem !important;
    font-family: 'DM Mono', monospace !important;
}}

/* section typography */
.sec-label {{
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: {C['accent']};
    margin-bottom: 3px;
}}
.sec-title {{
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: {C['text']};
    margin-bottom: 18px;
    padding-bottom: 10px;
    border-bottom: 1px solid {C['border']};
}}

/* hero */
.hero {{
    background: linear-gradient(135deg, {C['surface']} 0%, #0d1829 55%, #080f1c 100%);
    border: 1px solid {C['border']};
    border-radius: 18px;
    padding: 32px 38px 28px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}}
.hero::before {{
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, {C['accent']}15 0%, transparent 65%);
    pointer-events: none;
}}
.hero::after {{
    content: '';
    position: absolute;
    bottom: -60px; left: 30%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, {C['accent2']}0d 0%, transparent 65%);
    pointer-events: none;
}}
.hero-title {{
    font-family: 'Syne', sans-serif;
    font-size: 2.4rem;
    font-weight: 800;
    color: {C['text']};
    letter-spacing: -.04em;
    line-height: 1.05;
    margin-bottom: 8px;
}}
.hero-title span {{ color: {C['accent']}; }}
.hero-sub {{
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    color: {C['muted']};
    letter-spacing: .05em;
    margin-top: 2px;
}}
.hero-pills {{ display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }}
.pill {{
    display: inline-block;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.68rem;
    letter-spacing: .07em;
    font-family: 'DM Mono', monospace;
}}
.pill-blue  {{ background:{C['accent']}18; border:1px solid {C['accent']}44; color:{C['accent']}; }}
.pill-green {{ background:{C['accent2']}15; border:1px solid {C['accent2']}44; color:{C['accent2']}; }}
.pill-amber {{ background:{C['accent3']}15; border:1px solid {C['accent3']}44; color:{C['accent3']}; }}

/* insight cards */
.insight-card {{
    background: {C['card']};
    border: 1px solid {C['border']};
    border-left: 3px solid {C['accent']};
    border-radius: 0 10px 10px 0;
    padding: 13px 16px;
    margin: 8px 0;
    font-size: 0.82rem;
    line-height: 1.65;
    color: {C['text']};
}}
.insight-card b  {{ color: {C['accent2']}; }}
.insight-card.warn  {{ border-left-color: {C['accent3']}; }}
.insight-card.warn b {{ color: {C['accent3']}; }}
.insight-card.danger {{ border-left-color: {C['accent4']}; }}
.insight-card.danger b {{ color: {C['accent4']}; }}

/* chart wrapper */
.chart-card {{
    background: {C['card']};
    border: 1px solid {C['border']};
    border-radius: 14px;
    padding: 4px;
    margin-bottom: 16px;
    transition: border-color .25s;
}}
.chart-card:hover {{ border-color: {C['accent']}33; }}

/* dataframe */
.stDataFrame {{ border-radius: 12px !important; overflow: hidden; }}
.stDataFrame table {{
    background: {C['card']} !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 0.79rem !important;
}}
.stDataFrame th {{
    background: {C['surface']} !important;
    color: {C['muted']} !important;
    letter-spacing: .08em;
    text-transform: uppercase;
    font-size: 0.65rem !important;
    border-bottom: 1px solid {C['border']} !important;
}}
.stDataFrame td {{ color: {C['text']} !important; border-color: {C['border']} !important; }}

/* download button */
.stDownloadButton > button {{
    background: transparent !important;
    border: 1px solid {C['accent']}55 !important;
    color: {C['accent']} !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 0.76rem !important;
    letter-spacing: .07em;
    border-radius: 8px !important;
    padding: 6px 20px !important;
    transition: all .2s !important;
}}
.stDownloadButton > button:hover {{
    background: {C['accent']}15 !important;
    border-color: {C['accent']} !important;
    box-shadow: 0 0 14px {C['accent']}22 !important;
}}

hr {{ border-color: {C['border']} !important; margin: 30px 0; }}
.stRadio label {{ color: {C['text']} !important; font-size: 0.82rem !important; }}
.stNumberInput input {{
    background: {C['card']} !important;
    border-color: {C['border']} !important;
    color: {C['text']} !important;
    font-family: 'DM Mono', monospace !important;
    border-radius: 8px !important;
}}
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════
#  CORE FINANCIAL LOGIC
# ══════════════════════════════════════════════

def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
    """EMI = P·r·(1+r)^n / [(1+r)^n - 1]"""
    if annual_rate == 0:
        return round(principal / months, 2)
    r = annual_rate / (12 * 100)
    f = (1 + r) ** months
    return round(principal * r * f / (f - 1), 2)


def generate_schedule(
    principal: float,
    annual_rate: float,
    months: int,
    extra_payment: float = 0.0,
) -> pd.DataFrame:
    """Full amortization schedule with optional prepayment."""
    r   = annual_rate / (12 * 100)
    emi = calculate_emi(principal, annual_rate, months)
    rows, balance = [], principal

    for month in range(1, months + 1):
        if balance <= 0:
            break
        interest_paid  = round(balance * r, 2)
        principal_paid = round(min(emi - interest_paid, balance), 2)
        extra          = round(min(extra_payment, max(balance - principal_paid, 0)), 2)
        balance        = round(max(balance - principal_paid - extra, 0), 2)
        rows.append(dict(
            Month=month, EMI=emi,
            Interest_Paid=interest_paid, Principal_Paid=principal_paid,
            Extra_Payment=extra, Total_Paid=round(emi + extra, 2),
            Balance=balance,
        ))
        if balance <= 0:
            break

    df         = pd.DataFrame(rows)
    df["Year"] = ((df["Month"] - 1) // 12 + 1).astype(int)
    return df


def yearly_summary(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.groupby("Year", as_index=False)
        .agg(Total_EMI=("EMI","sum"), Interest_Paid=("Interest_Paid","sum"),
             Principal_Paid=("Principal_Paid","sum"),
             Extra_Payment=("Extra_Payment","sum"),
             Closing_Balance=("Balance","last"))
        .round(2)
    )


# ══════════════════════════════════════════════
#  CHART HELPERS
# ══════════════════════════════════════════════

def _inr(v: float) -> str:
    if v >= 1_00_00_000: return f"₹{v/1_00_00_000:.1f}Cr"
    if v >= 1_00_000:    return f"₹{v/1_00_000:.1f}L"
    return f"₹{v:,.0f}"


def _arrow(x, y, text, ax=45, ay=-45, color=None):
    """Build a Plotly annotation dict with an arrow pointer."""
    col = color or C["arrow"]
    return dict(
        x=x, y=y, text=text.replace("\n", "<br>"),
        showarrow=True,
        arrowhead=3, arrowsize=1.3, arrowwidth=1.8, arrowcolor=col,
        ax=ax, ay=ay,
        bgcolor=C["surface"], bordercolor=col,
        borderwidth=1, borderpad=6,
        font=dict(family="'DM Mono',monospace", size=10, color=col),
        align="left",
    )


def _base_layout(fig, title="", height=400):
    layout = {**PLOTLY_LAYOUT, "height": height}
    if title:
        layout["title"] = dict(
            text=title,
            font=dict(family="'Syne',sans-serif", size=13, color=C["text"]),
            x=0.0, xanchor="left", pad=dict(l=8),
        )
    fig.update_layout(**layout)


# ── Chart 1: Balance over time ────────────────────────────────────────────
def chart_balance(df: pd.DataFrame, df_base: pd.DataFrame = None) -> go.Figure:
    fig = go.Figure()

    if df_base is not None and len(df_base) != len(df):
        fig.add_trace(go.Scatter(
            x=df_base["Month"], y=df_base["Balance"],
            mode="lines", name="Without Prepayment",
            line=dict(color=C["muted"], width=1.5, dash="dot"),
            hovertemplate="Month %{x} — Balance: ₹%{y:,.0f}<extra></extra>",
        ))

    fig.add_trace(go.Scatter(
        x=df["Month"], y=df["Balance"],
        mode="lines", name="Loan Balance",
        line=dict(color=C["line1"], width=2.8),
        fill="tozeroy", fillcolor=C["fill1"],
        hovertemplate="Month %{x} — Balance: ₹%{y:,.0f}<extra></extra>",
    ))

    n      = len(df)
    start  = float(df["Balance"].iloc[0])
    mid_i  = n // 2
    mid_x  = int(df["Month"].iloc[mid_i])
    mid_y  = float(df["Balance"].iloc[mid_i])
    end_x  = int(df["Month"].iloc[-1])

    annotations = [
        _arrow(1, start,
               f"Loan Start\n{_inr(start)}",
               ax=55, ay=-40, color=C["accent"]),
        _arrow(mid_x, mid_y,
               f"Midpoint (Mo {mid_x})\n{_inr(mid_y)} left",
               ax=-55, ay=-45, color=C["accent3"]),
        _arrow(end_x, 0,
               f"Loan Closed\nMonth {end_x}",
               ax=50, ay=-38, color=C["accent2"]),
    ]
    if df_base is not None and len(df_base) != len(df):
        saved = len(df_base) - len(df)
        annotations.append(_arrow(
            end_x, mid_y * 0.45,
            f"↑ {saved} months\nsaved by prepay",
            ax=-65, ay=45, color=C["accent3"],
        ))

    _base_layout(fig, "Remaining Loan Balance — Month by Month", height=420)
    fig.update_layout(annotations=annotations)
    fig.update_xaxes(title_text="Month")
    fig.update_yaxes(title_text="Outstanding Balance (₹)", tickprefix="₹", tickformat=",.0f")
    return fig


# ── Chart 2: Principal vs Interest lines ──────────────────────────────────
def chart_pi(df: pd.DataFrame) -> go.Figure:
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df["Month"], y=df["Interest_Paid"],
        mode="lines", name="Interest per EMI",
        line=dict(color=C["accent4"], width=2.5),
        fill="tozeroy", fillcolor="rgba(248,113,113,0.09)",
        hovertemplate="Month %{x}<br>Interest: ₹%{y:,.0f}<extra></extra>",
    ))
    fig.add_trace(go.Scatter(
        x=df["Month"], y=df["Principal_Paid"],
        mode="lines", name="Principal per EMI",
        line=dict(color=C["accent2"], width=2.5),
        fill="tozeroy", fillcolor=C["fill2"],
        hovertemplate="Month %{x}<br>Principal: ₹%{y:,.0f}<extra></extra>",
    ))

    annotations = []
    cross = df[df["Principal_Paid"] >= df["Interest_Paid"]].head(1)
    if not cross.empty:
        cx = int(cross["Month"].values[0])
        cy = float(cross["Principal_Paid"].values[0])
        annotations.append(_arrow(cx, cy,
            f"Crossover — Month {cx}\nPrincipal > Interest",
            ax=60, ay=-48, color=C["arrow"]))

    annotations.append(_arrow(
        1, float(df["Interest_Paid"].iloc[0]),
        f"Peak Interest\n{_inr(df['Interest_Paid'].iloc[0])}/mo",
        ax=55, ay=-35, color=C["accent4"],
    ))
    last_m = int(df["Month"].iloc[-1])
    annotations.append(_arrow(
        last_m, float(df["Principal_Paid"].iloc[-1]),
        f"Final Month {last_m}",
        ax=-55, ay=-35, color=C["accent2"],
    ))

    _base_layout(fig, "Principal vs Interest — Per EMI", height=420)
    fig.update_layout(annotations=annotations)
    fig.update_xaxes(title_text="Month")
    fig.update_yaxes(title_text="Amount (₹)", tickprefix="₹", tickformat=",.0f")
    return fig


# ── Chart 3: Cumulative repayment lines ───────────────────────────────────
def chart_cumulative(df: pd.DataFrame) -> go.Figure:
    df = df.copy()
    df["Cum_Principal"] = df["Principal_Paid"].cumsum()
    df["Cum_Interest"]  = df["Interest_Paid"].cumsum()

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df["Month"], y=df["Cum_Principal"],
        mode="lines", name="Cumulative Principal",
        line=dict(color=C["accent2"], width=2.5),
        hovertemplate="Month %{x}<br>Principal Paid: ₹%{y:,.0f}<extra></extra>",
    ))
    fig.add_trace(go.Scatter(
        x=df["Month"], y=df["Cum_Interest"],
        mode="lines", name="Cumulative Interest",
        line=dict(color=C["accent4"], width=2.5),
        hovertemplate="Month %{x}<br>Interest Paid: ₹%{y:,.0f}<extra></extra>",
    ))

    annotations = []
    n = len(df)
    for pct, col in [(0.25, C["accent"]), (0.5, C["arrow"]), (0.75, C["accent2"])]:
        idx = max(0, int(pct * n) - 1)
        m   = int(df["Month"].iloc[idx])
        p   = float(df["Cum_Principal"].iloc[idx])
        i   = float(df["Cum_Interest"].iloc[idx])
        annotations.append(_arrow(m, p,
            f"{int(pct*100)}% mark\nTotal paid: {_inr(p+i)}",
            ax=-20, ay=-50, color=col))

    _base_layout(fig, "Cumulative Repayment — Principal & Interest", height=420)
    fig.update_layout(annotations=annotations)
    fig.update_xaxes(title_text="Month")
    fig.update_yaxes(title_text="Cumulative Amount (₹)", tickprefix="₹", tickformat=",.0f")
    return fig


# ── Chart 4: Donut ─────────────────────────────────────────────────────────
def chart_donut(principal: float, total_interest: float) -> go.Figure:
    fig = go.Figure(go.Pie(
        labels=["Principal", "Interest"],
        values=[principal, total_interest],
        hole=0.62,
        marker=dict(colors=[C["accent2"], C["accent4"]],
                    line=dict(color=C["bg"], width=3)),
        textinfo="label+percent",
        textfont=dict(family="'DM Mono',monospace", size=11, color=C["text"]),
        hovertemplate="%{label}: ₹%{value:,.0f}<extra></extra>",
        direction="clockwise",
    ))
    total = principal + total_interest
    fig.add_annotation(
        text=f"<b>{_inr(total)}</b><br><span style='font-size:10px'>Total Cost</span>",
        x=0.5, y=0.5, showarrow=False,
        font=dict(family="'Syne',sans-serif", size=14, color=C["text"]),
        align="center",
    )
    _base_layout(fig, "Loan Composition", height=380)
    return fig


# ── Chart 5: Yearly line chart (replaces bar chart) ───────────────────────
def chart_yearly(df_year: pd.DataFrame) -> go.Figure:
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df_year["Year"], y=df_year["Interest_Paid"],
        mode="lines+markers", name="Interest Paid",
        line=dict(color=C["accent4"], width=2.5),
        marker=dict(size=8, color=C["accent4"],
                    line=dict(color=C["bg"], width=2)),
        hovertemplate="Year %{x}<br>Interest: ₹%{y:,.0f}<extra></extra>",
    ))
    fig.add_trace(go.Scatter(
        x=df_year["Year"], y=df_year["Principal_Paid"],
        mode="lines+markers", name="Principal Paid",
        line=dict(color=C["accent2"], width=2.5),
        marker=dict(size=8, color=C["accent2"],
                    line=dict(color=C["bg"], width=2)),
        hovertemplate="Year %{x}<br>Principal: ₹%{y:,.0f}<extra></extra>",
    ))
    if df_year["Extra_Payment"].sum() > 0:
        fig.add_trace(go.Scatter(
            x=df_year["Year"], y=df_year["Extra_Payment"],
            mode="lines+markers", name="Prepayments",
            line=dict(color=C["accent3"], width=2, dash="dash"),
            marker=dict(size=7, color=C["accent3"],
                        line=dict(color=C["bg"], width=1)),
            hovertemplate="Year %{x}<br>Prepayment: ₹%{y:,.0f}<extra></extra>",
        ))

    annotations = []
    cross = df_year[df_year["Principal_Paid"] >= df_year["Interest_Paid"]].head(1)
    if not cross.empty:
        cy_x = int(cross["Year"].values[0])
        cy_y = float(cross["Principal_Paid"].values[0])
        annotations.append(_arrow(cy_x, cy_y,
            f"Year {cy_x}: Principal\nfinally > Interest",
            ax=60, ay=-48, color=C["arrow"]))

    max_i_yr = int(df_year.loc[df_year["Interest_Paid"].idxmax(), "Year"])
    max_i_v  = float(df_year["Interest_Paid"].max())
    annotations.append(_arrow(max_i_yr, max_i_v,
        f"Highest Interest Year\n{_inr(max_i_v)}",
        ax=60, ay=-40, color=C["accent4"]))

    # Arrow on last year
    last_yr = int(df_year["Year"].iloc[-1])
    last_p  = float(df_year["Principal_Paid"].iloc[-1])
    annotations.append(_arrow(last_yr, last_p,
        f"Final Year {last_yr}",
        ax=-55, ay=-35, color=C["accent2"]))

    _base_layout(fig, "Yearly — Principal vs Interest Paid", height=420)
    fig.update_layout(annotations=annotations)
    fig.update_xaxes(title_text="Year", dtick=1)
    fig.update_yaxes(title_text="Annual Amount (₹)", tickprefix="₹", tickformat=",.0f")
    return fig


# ══════════════════════════════════════════════
#  SIDEBAR — INPUTS
# ══════════════════════════════════════════════

with st.sidebar:
    st.markdown(f"""
    <div style='padding:6px 0 22px'>
      <div style='font-family:Syne,sans-serif;font-size:1.3rem;font-weight:800;
                  color:{C["accent"]};letter-spacing:-.02em;'>💳 LOAN SIMULATOR</div>
      <div style='font-size:0.62rem;color:{C["muted"]};letter-spacing:.14em;
                  text-transform:uppercase;margin-top:3px;'>Configure parameters</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"<span style='font-size:.72rem;color:{C['muted']};letter-spacing:.1em;text-transform:uppercase;'>Principal Amount (₹)</span>", unsafe_allow_html=True)
    loan_amount = st.number_input("loan_amount", min_value=10_000, max_value=100_000_000,
                                   value=2_500_000, step=50_000, label_visibility="collapsed")

    st.markdown(f"<span style='font-size:.72rem;color:{C['muted']};letter-spacing:.1em;text-transform:uppercase;'>Annual Interest Rate</span>", unsafe_allow_html=True)
    annual_rate = st.slider("annual_rate", 1.0, 30.0, 8.5, 0.1,
                             format="%.1f%%", label_visibility="collapsed")
    st.caption(f"Monthly rate: {annual_rate/12:.4f}%  ·  Effective annual: {((1+annual_rate/1200)**12-1)*100:.2f}%")

    st.markdown(f"<span style='font-size:.72rem;color:{C['muted']};letter-spacing:.1em;text-transform:uppercase;'>Loan Tenure</span>", unsafe_allow_html=True)
    tc1, tc2 = st.columns([1, 2])
    with tc1:
        tenure_type = st.radio("ttype", ["Yrs", "Mos"], label_visibility="collapsed")
    with tc2:
        if tenure_type == "Yrs":
            tenure_val    = st.number_input("tyrs", 1, 30, 20, label_visibility="collapsed")
            tenure_months = tenure_val * 12
        else:
            tenure_val    = st.number_input("tmos", 6, 360, 240, label_visibility="collapsed")
            tenure_months = tenure_val

    st.markdown("---")
    st.markdown(f"<span style='font-size:.72rem;color:{C['muted']};letter-spacing:.1em;text-transform:uppercase;'>💸 Extra Monthly Prepayment (₹)</span>", unsafe_allow_html=True)
    extra_payment = st.number_input("extra", min_value=0, max_value=500_000,
                                     value=0, step=1_000, label_visibility="collapsed")

    st.markdown("---")
    st.markdown(f"<span style='font-size:.72rem;color:{C['muted']};letter-spacing:.1em;text-transform:uppercase;'>Schedule View</span>", unsafe_allow_html=True)
    view_mode = st.radio("view", ["Monthly", "Yearly"], horizontal=True,
                          label_visibility="collapsed")


# ══════════════════════════════════════════════
#  CALCULATIONS
# ══════════════════════════════════════════════

emi            = calculate_emi(loan_amount, annual_rate, tenure_months)
df_base        = generate_schedule(loan_amount, annual_rate, tenure_months, 0)
df_active      = generate_schedule(loan_amount, annual_rate, tenure_months, extra_payment)
total_interest = round(df_active["Interest_Paid"].sum(), 2)
total_paid     = round(df_active["Total_Paid"].sum(), 2)
actual_months  = len(df_active)
months_saved   = len(df_base) - actual_months
pct_interest   = total_interest / total_paid * 100
base_interest  = round(df_base["Interest_Paid"].sum(), 2)
saved_interest = round(base_interest - total_interest, 2)


# ══════════════════════════════════════════════
#  HERO
# ══════════════════════════════════════════════

tenure_str = f"{tenure_val} {'years' if tenure_type=='Yrs' else 'months'}"
st.markdown(f"""
<div class="hero">
  <div class="hero-title">Loan <span>Analysis</span> Dashboard</div>
  <div class="hero-sub">
    ₹{loan_amount:,.0f} &nbsp;·&nbsp; {annual_rate}% p.a. &nbsp;·&nbsp; {tenure_str}
    {"&nbsp;·&nbsp; ₹" + f"{extra_payment:,.0f}/mo prepayment" if extra_payment > 0 else ""}
  </div>
  <div class="hero-pills">
    <span class="pill pill-blue">EMI ₹{emi:,.0f}/mo</span>
    <span class="pill pill-{'green' if pct_interest < 40 else 'amber'}">
      {pct_interest:.1f}% as interest
    </span>
    {"<span class='pill pill-amber'>⚡ " + str(months_saved) + " months saved</span>" if months_saved > 0 else ""}
    <span class="pill pill-blue">{actual_months} months tenure</span>
  </div>
</div>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════
#  METRIC CARDS
# ══════════════════════════════════════════════

mc1, mc2, mc3, mc4, mc5 = st.columns(5)
with mc1: st.metric("Monthly EMI",    f"₹{emi:,.0f}")
with mc2: st.metric("Total Interest", f"₹{total_interest:,.0f}")
with mc3: st.metric("Total Payment",  f"₹{total_paid:,.0f}")
with mc4: st.metric("Interest Ratio", f"{pct_interest:.1f}%")
with mc5: st.metric(
    "Actual Tenure",
    f"{actual_months} mo",
    delta=f"−{months_saved} mo" if months_saved > 0 else None,
    delta_color="inverse",
)

st.markdown("<br>", unsafe_allow_html=True)


# ══════════════════════════════════════════════
#  INSIGHTS
# ══════════════════════════════════════════════

st.markdown('<div class="sec-label">Financial Intelligence</div>', unsafe_allow_html=True)
st.markdown('<div class="sec-title">Key Insights</div>', unsafe_allow_html=True)

crossover_row   = df_active[df_active["Principal_Paid"] >= df_active["Interest_Paid"]].head(1)
crossover_month = int(crossover_row["Month"].values[0]) if not crossover_row.empty else None
yr1_interest    = round(df_active[df_active["Year"] == 1]["Interest_Paid"].sum(), 0)
effective_cost  = round(total_interest / loan_amount * 100, 1)

ic1, ic2 = st.columns(2)
with ic1:
    st.markdown(
        f'<div class="insight-card">💡 You pay <b>{pct_interest:.1f}%</b> of total outflow '
        f'as interest — <b>₹{total_interest:,.0f}</b> on a ₹{loan_amount:,.0f} loan.</div>',
        unsafe_allow_html=True,
    )
    if crossover_month:
        st.markdown(
            f'<div class="insight-card">🔄 <b>Crossover at Month {crossover_month}</b>: '
            f'from here each EMI repays more principal than interest — loan shrinks faster.</div>',
            unsafe_allow_html=True,
        )
    st.markdown(
        f'<div class="insight-card warn">📅 <b>Year 1 interest burden:</b> '
        f'₹{yr1_interest:,.0f} — that\'s {yr1_interest/total_interest*100:.1f}% '
        f'of your entire interest paid in just 12 months.</div>',
        unsafe_allow_html=True,
    )

with ic2:
    st.markdown(
        f'<div class="insight-card">📈 <b>Effective loan cost:</b> {effective_cost}% of principal '
        f'paid as interest over the full tenure.</div>',
        unsafe_allow_html=True,
    )
    if extra_payment > 0 and saved_interest > 0:
        st.markdown(
            f'<div class="insight-card">⚡ Prepaying <b>₹{extra_payment:,.0f}/mo</b> saves '
            f'<b>₹{saved_interest:,.0f}</b> in interest and closes your loan '
            f'<b>{months_saved} months earlier</b>.</div>',
            unsafe_allow_html=True,
        )
        per_k = round(saved_interest / (extra_payment / 1000), 0)
        st.markdown(
            f'<div class="insight-card warn">📊 ROI on prepayment: every <b>₹1,000 extra/month</b> '
            f'saves you approx. <b>₹{per_k:,.0f}</b> total interest.</div>',
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            f'<div class="insight-card">💡 Your EMI of <b>₹{emi:,.0f}</b> is '
            f'{emi/(loan_amount/tenure_months)*100:.1f}% of a flat instalment due to compounding. '
            f'Try adding a prepayment to see savings.</div>',
            unsafe_allow_html=True,
        )

st.markdown("<br>", unsafe_allow_html=True)


# ══════════════════════════════════════════════
#  CHARTS
# ══════════════════════════════════════════════

st.markdown('<div class="sec-label">Visualisations</div>', unsafe_allow_html=True)
st.markdown(
    f'<div class="sec-title">Interactive Charts '
    f'<span style="font-size:.72rem;color:{C["muted"]};font-family:\'DM Mono\',monospace;'
    f'font-weight:400;">· hover · zoom · pan · arrows mark key moments</span></div>',
    unsafe_allow_html=True,
)

# Row 1: Balance (wide) + Donut
row1a, row1b = st.columns([2.2, 1])
with row1a:
    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(
        chart_balance(df_active, df_base if extra_payment > 0 else None),
        use_container_width=True, config={"displayModeBar": False},
    )
    st.markdown('</div>', unsafe_allow_html=True)
with row1b:
    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(chart_donut(loan_amount, total_interest),
                    use_container_width=True, config={"displayModeBar": False})
    st.markdown('</div>', unsafe_allow_html=True)

# Row 2: Principal/Interest + Cumulative
row2a, row2b = st.columns(2)
with row2a:
    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(chart_pi(df_active),
                    use_container_width=True, config={"displayModeBar": False})
    st.markdown('</div>', unsafe_allow_html=True)
with row2b:
    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(chart_cumulative(df_active),
                    use_container_width=True, config={"displayModeBar": False})
    st.markdown('</div>', unsafe_allow_html=True)

# Row 3: Yearly line chart (full width)
if actual_months >= 24:
    df_year_agg = yearly_summary(df_active)
    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(chart_yearly(df_year_agg),
                    use_container_width=True, config={"displayModeBar": False})
    st.markdown('</div>', unsafe_allow_html=True)


# ══════════════════════════════════════════════
#  AMORTIZATION TABLE
# ══════════════════════════════════════════════

st.markdown("<br>", unsafe_allow_html=True)
st.markdown('<div class="sec-label">Schedule</div>', unsafe_allow_html=True)
st.markdown('<div class="sec-title">Amortization Table</div>', unsafe_allow_html=True)

if view_mode == "Monthly":
    disp = df_active[["Month","Year","EMI","Interest_Paid","Principal_Paid",
                       "Extra_Payment","Total_Paid","Balance"]].copy()
    disp.columns = ["Month","Year","EMI (₹)","Interest (₹)","Principal (₹)",
                    "Prepayment (₹)","Total Paid (₹)","Balance (₹)"]
    for col in ["EMI (₹)","Interest (₹)","Principal (₹)","Prepayment (₹)","Total Paid (₹)","Balance (₹)"]:
        disp[col] = disp[col].apply(lambda x: f"{x:,.2f}")
    st.dataframe(disp, use_container_width=True, height=420, hide_index=True)
else:
    df_yr = yearly_summary(df_active).copy()
    df_yr.columns = ["Year","Total EMI (₹)","Interest (₹)","Principal (₹)",
                     "Prepayments (₹)","Closing Balance (₹)"]
    for col in df_yr.columns[1:]:
        df_yr[col] = df_yr[col].apply(lambda x: f"{x:,.2f}")
    st.dataframe(df_yr, use_container_width=True, height=380, hide_index=True)

dl_c, _ = st.columns([1, 3])
with dl_c:
    st.download_button("⬇  Download CSV",
                        data=df_active.to_csv(index=False).encode("utf-8"),
                        file_name="loan_amortization.csv", mime="text/csv")


# ══════════════════════════════════════════════
#  PREPAYMENT COMPARISON
# ══════════════════════════════════════════════

if extra_payment > 0:
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="sec-label">Impact Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">Prepayment vs Standard Schedule</div>', unsafe_allow_html=True)

    comp = pd.DataFrame({
        "Metric":             ["Tenure","Total Interest","Total Amount Paid","Monthly Outflow"],
        "Without Prepayment": [f"{len(df_base)} months", f"₹{base_interest:,.0f}",
                               f"₹{df_base['Total_Paid'].sum():,.0f}", f"₹{emi:,.0f}"],
        "With Prepayment":    [f"{actual_months} months", f"₹{total_interest:,.0f}",
                               f"₹{total_paid:,.0f}", f"₹{emi+extra_payment:,.0f}"],
        "Savings / Change":   [f"−{months_saved} months", f"−₹{saved_interest:,.0f}",
                               f"−₹{df_base['Total_Paid'].sum()-total_paid:,.0f}",
                               f"+₹{extra_payment:,.0f}"],
    })
    st.dataframe(comp, use_container_width=True, hide_index=True)


# ── FOOTER ────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    f"<div style='text-align:center;color:{C['muted']};font-size:.68rem;"
    f"font-family:DM Mono,monospace;letter-spacing:.07em;'>"
    f"LOAN SIMULATOR &nbsp;·&nbsp; Streamlit + Plotly &nbsp;·&nbsp; Python only &nbsp;·&nbsp; "
    f"EMI = P·r·(1+r)ⁿ / [(1+r)ⁿ−1] &nbsp;·&nbsp; Monthly compounding"
    f"</div>",
    unsafe_allow_html=True,
)