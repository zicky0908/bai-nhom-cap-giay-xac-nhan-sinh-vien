"""Phân tích event log mô phỏng: KPI (pandas, phút làm việc GA1), DFG và biến thể (PM4Py), biểu đồ.

DỮ LIỆU MÔ PHỎNG – không phải số đo tại trường. Mục tiêu KPI là dự kiến.
"""
import argparse
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

import simulate
from workcal import DAY, from_local, work_between

GA4 = 2250            # ngưỡng quá hạn toàn trình, phút làm việc
WAIT_LIMIT = 450      # ngưỡng chờ cho tiêu chí (b)
MAIN_SEED = simulate.SEEDS[0]
LABEL = 'Dữ liệu mô phỏng'
TERMINAL = ('A11', 'A13', 'A14')
NOT_SCHOOL_WAIT = ('A05', 'A12', 'A16', 'A13')
RATE_COLS = ('K5_overdue_share_med', 'K5b_overdue_gross_med', 'K6_e3_rate', 'K9_rework_rate')
WIN_COLS = ('K1_t_truong_med', 'K2_t_net_p90', 'K3_wait_a07_med', 'K4_l2_proc_per_case', 'K5_overdue_share_med')


def instances(case):
    """Ghép start/complete thành các lần thực hiện (act, s, c) theo thứ tự trong ca."""
    out, open_ = [], {}
    for r in case.itertuples():
        if r.lifecycle == 'start':
            open_[r.activity] = r.t_min
        else:
            out.append((r.activity, open_.pop(r.activity, r.t_min), r.t_min, r.decision))
    return out


def a01_rounded(t):
    return int(t // DAY) * DAY + 450   # GA10: làm tròn về 07:30 cho cả hai kịch bản


def case_metrics(case):
    inst = instances(case)
    acts = [a for a, *_ in inst]
    t0 = a01_rounded(inst[0][1])
    m = dict(case_id=case.case_id.iat[0], pair_id=case.pair_id.iat[0], a01=inst[0][1],
             rework=acts.count('A04'), e3='A13' in acts, rejected='A14' in acts)
    end = next((c for a, s, c, _ in inst if a in TERMINAL), None)
    m['end'] = end
    m['t_truong'] = work_between(t0, end) if end is not None else np.nan
    a12 = next((c for a, s, c, _ in inst if a == 'A12'), None)
    m['t_sv'] = work_between(t0, a12) if a12 is not None else np.nan
    # thời gian phía SV: c(A04) → min(c(A05), due_at)
    due = case.loc[(case.activity == 'A04') & (case.lifecycle == 'complete'), 'due_at']
    dues = [from_local(pd.Timestamp(d).tz_convert('Asia/Ho_Chi_Minh').tz_localize(None)) for d in due]
    sv = 0.0
    a04s = [c for a, s, c, _ in inst if a == 'A04']
    a05s = [c for a, s, c, _ in inst if a == 'A05']
    for k, c4 in enumerate(a04s):
        stop = min(a05s[k], dues[k]) if k < len(a05s) else dues[k]
        sv += work_between(c4, stop)
    m['t_sv_part'] = sv
    m['t_net'] = m['t_truong'] - sv if end is not None else np.nan
    # chờ trước lần A07 đầu tiên
    for k, (a, s, c, _) in enumerate(inst):
        if a == 'A07' and k:
            m['wait_a07'] = work_between(inst[k - 1][2], s)
            break
    else:
        m['wait_a07'] = np.nan
    a13 = case[(case.activity == 'A13') & (case.lifecycle == 'start')]
    m['detect_delay'] = (work_between(dues[-1], a13.t_min.iat[0]) if len(a13) else np.nan)
    off = [(s, c) for a, s, c, _ in inst if case.loc[case.activity == a, 'role'].iat[0] == 'officer']
    m['l2_proc'] = sum(work_between(s, c) for s, c in off)
    m['sv_windows'] = [(c4, min(a05s[k], dues[k]) if k < len(a05s) else dues[k]) for k, c4 in enumerate(a04s)]
    return m


def net_age(row, f):
    """Tuổi net tại mốc f = tuổi gross − thời gian SV đã dùng tới f (mục 4.2)."""
    gross = work_between(a01_rounded(row.a01), f)
    sv = sum(work_between(a, min(b, f)) for a, b in row.sv_windows if a < f)
    return gross, gross - sv


def kpis(log):
    rows = []
    for (cfg, seed), g in log.groupby(['cfg', 'seed'], sort=False):
        cm = pd.DataFrame([case_metrics(c) for _, c in g.groupby('case_id', sort=False)])
        fridays = [d * DAY + 1020 for d in range(4, simulate.ARRIVAL_DAYS // 5 * 7, 7)]
        overdue, overdue_gross = [], []
        for f in fridays:
            open_ = cm[(cm.a01 <= f) & ((cm.end.isna()) | (cm.end > f))]
            if len(open_):
                ages = np.array([net_age(r, f) for r in open_.itertuples()])
                overdue_gross.append(np.mean(ages[:, 0] > GA4))
                overdue.append(np.mean(ages[:, 1] > GA4))
        rows.append(dict(
            cfg=cfg, seed=seed,
            K1_t_truong_med=cm.t_truong.median(), K1_t_truong_p90=cm.t_truong.quantile(0.9),
            K2_t_net_med=cm.t_net.median(), K2_t_net_p90=cm.t_net.quantile(0.9),
            K3_wait_a07_med=cm.wait_a07.median(),
            K4_l2_proc_per_case=cm.l2_proc.mean(),
            K5_overdue_share_med=float(np.median(overdue)) if overdue else np.nan,
            K5b_overdue_gross_med=float(np.median(overdue_gross)) if overdue_gross else np.nan,
            K6_e3_rate=cm.e3.sum() / max(1, (cm.rework > 0).sum()),
            K9_rework_rate=(cm.rework > 0).mean(), K9_rounds_mean=cm.rework.mean(),
            detect_delay_med=cm.detect_delay.median(),
            t_sv_med=cm.t_sv.median(), open_at_horizon=cm.end.isna().sum(),
        ))
    return pd.DataFrame(rows)


def summarize(k):
    cols = [c for c in k.columns if c not in ('cfg', 'seed')]
    agg = k.groupby('cfg', sort=False)[cols].agg(['median', 'min', 'max'])
    base = k[k.cfg == 'AS-IS'].set_index('seed')
    wins, diffs = {}, {}
    for cfg, g in k.groupby('cfg', sort=False):
        if cfg == 'AS-IS':
            continue
        g = g.set_index('seed')
        wins[cfg] = {c: int((g[c] < base[c]).sum()) for c in WIN_COLS}
        # hiệu theo cặp cùng seed (CRN): trung vị (min–max) của TO-BE − AS-IS
        diffs[cfg] = {c: (lambda d: f"{d.median():+.0f} ({d.min():+.0f} đến {d.max():+.0f})")(g[c] - base[c])
                      if c not in RATE_COLS else
                      (lambda d: f"{d.median() * 100:+.1f} điểm % ({d.min() * 100:+.1f} đến {d.max() * 100:+.1f})")(g[c] - base[c])
                      for c in WIN_COLS}
    return agg, pd.DataFrame(wins).T, pd.DataFrame(diffs).T


# ---------- PM4Py ----------
def pm4py_views(log):
    with open(os.devnull, 'w') as null:
        stdout, sys.stdout = sys.stdout, null
        import pm4py
        sys.stdout = stdout
    comp = log[log.lifecycle == 'complete'].copy()
    comp['time:timestamp'] = pd.to_datetime(comp.timestamp)
    df = pm4py.format_dataframe(comp, case_id='case_id', activity_key='activity', timestamp_key='time:timestamp')
    dfg, starts, ends = pm4py.discover_dfg(df)
    variants = pm4py.get_variants(df)
    top = sorted(variants.items(), key=lambda kv: -(kv[1] if isinstance(kv[1], int) else len(kv[1])))[:5]
    n = df['case:concept:name'].nunique()
    top = [(' → '.join(v), (c if isinstance(c, int) else len(c)), (c if isinstance(c, int) else len(c)) / n) for v, c in top]
    return dfg, top, pm4py.__version__


def normalized_variants(log):
    """Biến thể để so AS-IS/TO-BE (mục 4.2): bỏ A15/A16, gộp A06+A17 thành A06, A07(reject)+A10 thành A07."""
    comp = log[log.lifecycle == 'complete']
    seqs = []
    for _, case in comp.groupby('case_id', sort=False):
        acts = [a for a in case.activity if a not in ('A15', 'A16', 'A17', 'A10')]
        seqs.append(' → '.join(acts))
    s = pd.Series(seqs).value_counts()
    return pd.DataFrame({'cases': s, 'share': s / s.sum()})


def edge_stats(log):
    """Chờ trên mỗi cạnh = s(lần sau) − c(lần trước), phút làm việc; tô màu theo tiêu chí (a)(b)(f)."""
    rows = []
    for _, case in log.groupby('case_id', sort=False):
        inst = instances(case)
        for (a, s, c, _), (b, s2, c2, _) in zip(inst, inst[1:]):
            rows.append(dict(case_id=case.case_id.iat[0], edge=f'{a}→{b}', wait=work_between(c, s2)))
    e = pd.DataFrame(rows)
    n_cases = log.case_id.nunique()
    st = e.groupby('edge').agg(freq=('wait', 'size'), cases=('case_id', 'nunique'),
                               median=('wait', 'median'), p90=('wait', lambda x: x.quantile(0.9)))
    # tiêu chí (b) theo ca: tỷ lệ ca qua cạnh có ít nhất một lần chờ > ngưỡng
    st['over'] = e.groupby(['edge', 'case_id']).wait.max().gt(WAIT_LIMIT).groupby('edge').mean()
    # Chỉ cạnh đi vào bước của trường mới là "chờ của trường" (mục 4.2); A05/A12 là thời gian SV,
    # A16/A13 do timer và cửa sổ bổ sung của SV quyết định (trễ phát hiện đo riêng).
    st['school_wait'] = [e.split('→')[1] not in NOT_SCHOOL_WAIT for e in st.index]
    top3 = st[st.school_wait]['median'].nlargest(3).index
    st['a_top3'] = st.index.isin(top3)
    st['b_over50'] = st.school_wait & (st['over'] >= 0.5)
    st['f_freq10'] = st['cases'] / n_cases >= 0.10
    st['color'] = np.where(st.a_top3 & st.b_over50 & st.f_freq10, 'đỏ', np.where(st.a_top3, 'vàng', ''))
    st['phan_tan'] = (st['p90'] / st['median'].replace(0, np.nan)) > 3
    return st.sort_values('median', ascending=False)


# ---------- biểu đồ ----------
POS = {'A01': (0, 5), 'A15': (0, 4), 'A02': (1, 5), 'A03': (2, 5), 'A04': (2, 3.4), 'A05': (1, 3.4),
       'A16': (2, 2.2), 'A13': (3, 2.2), 'A06': (3, 5), 'A17': (4, 5), 'A07': (5, 5), 'A10': (5, 3.4),
       'A14': (6, 3.4), 'A08': (6, 5), 'A09': (7, 5), 'A11': (8, 5), 'A12': (9, 5)}


def plot_dfg(st, title, path):
    import matplotlib.pyplot as plt
    from matplotlib.patches import FancyArrowPatch
    fig, ax = plt.subplots(figsize=(13, 5.2))
    nodes = {x for e in st.index for x in e.split('→')}
    width = {e: 0.6 + 3.4 * st.at[e, 'freq'] / st['freq'].max() for e in st.index}
    labelled = []
    for e, r in st.iterrows():
        a, b = e.split('→')
        if a not in POS or b not in POS:
            continue
        col = {'đỏ': '#c0392b', 'vàng': '#e6a100'}.get(r.color, '#9aa0a6')
        rad = 0.35 if POS[b][0] <= POS[a][0] and a != b else 0.08
        ax.add_patch(FancyArrowPatch(POS[a], POS[b], arrowstyle='-|>', mutation_scale=12,
                                     connectionstyle=f'arc3,rad={rad}', color=col, lw=width[e],
                                     shrinkA=18, shrinkB=18, zorder=1))
        if r.color:
            # nhãn đặt sát đích, dưới đường nếu là cạnh nhảy cóc; nhiều cạnh cùng đích thì xếp chồng xuống
            skip = abs(POS[b][0] - POS[a][0]) > 1
            k = labelled.count(b)
            labelled.append(b)
            mx = POS[b][0] - (0.75 if skip else 0.5)
            my = POS[b][1] + (-0.32 - 0.24 * k if skip else 0.28)
            ax.text(mx, my, f"{a}→{b}: {r['median']:.0f}′", ha='center', fontsize=8, color=col, weight='bold')
    for n in nodes:
        if n in POS:
            ax.text(*POS[n], n, ha='center', va='center', fontsize=9, zorder=2,
                    bbox=dict(boxstyle='round,pad=0.35', fc='white', ec='#555'))
    ax.set_xlim(-0.6, 9.6)
    ax.set_ylim(1.6, 5.8)
    ax.axis('off')
    ax.set_title(f'{title}\nĐộ dày = tần suất; đỏ = ứng viên nghẽn (a+b+f), vàng = chỉ đạt (a); số = trung vị chờ (phút làm việc)',
                 fontsize=10, loc='left')
    fig.text(0.99, 0.01, LABEL, ha='right', fontsize=9, color='#c0392b')
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_kpis(k, path):
    import matplotlib.pyplot as plt
    cfgs = ['AS-IS', 'TB-S0-p15', 'TB-S1-p15', 'TB-S1-p30']
    names = {'AS-IS': 'AS-IS', 'TB-S0-p15': 'S0\nký theo lô', 'TB-S1-p15': 'S1\nký 2 lần/ngày',
             'TB-S1-p30': 'S1, bổ sung\nkhông giảm'}
    metrics = [('K1_t_truong_med', 'K1 Trung vị T_trường'), ('K2_t_net_p90', 'K2 P90 T_trường_net'),
               ('K3_wait_a07_med', 'K3 Trung vị chờ trước ký')]
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.4))
    for ax, (col, name) in zip(axes, metrics):
        g = k[k.cfg.isin(cfgs)].groupby('cfg')[col]
        med, lo, hi = g.median().reindex(cfgs), g.min().reindex(cfgs), g.max().reindex(cfgs)
        x = np.arange(len(cfgs))
        ax.bar(x, med, color=['#9aa0a6', '#7fa7d6', '#2f6db3', '#a9c4e6'])
        ax.errorbar(x, med, yerr=[med - lo, hi - med], fmt='none', ecolor='#333', capsize=4)
        ax.set_xticks(x, [names[c] for c in cfgs], fontsize=8)
        ax.set_title(name + ' (phút làm việc)', fontsize=10)
        ax.axhline(WAIT_LIMIT if col == 'K3_wait_a07_med' else GA4 if col == 'K2_t_net_p90' else np.nan,
                   ls='--', color='#c0392b', lw=1)
    fig.suptitle('KPI theo kịch bản: cột = trung vị qua 20 seed, vạch = min–max', fontsize=11, x=0.01, ha='left')
    fig.text(0.99, 0.01, LABEL, ha='right', fontsize=9, color='#c0392b')
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_wait_process(log, path):
    import matplotlib.pyplot as plt
    rows = []
    for cfg, g in log.groupby('cfg', sort=False):
        for _, case in g.groupby('case_id', sort=False):
            inst = instances(case)
            for k, (a, s, c, _) in enumerate(inst):
                if k and case.loc[case.activity == a, 'role'].iat[0] != 'student':
                    rows.append(dict(cfg=cfg, act=a, wait=work_between(inst[k - 1][2], s), proc=work_between(s, c)))
    d = pd.DataFrame(rows).groupby(['cfg', 'act'])[['wait', 'proc']].median().reset_index()
    acts = ['A02', 'A03', 'A04', 'A06', 'A17', 'A07', 'A08', 'A09', 'A11', 'A14']   # bỏ A13: cửa sổ chờ SV
    fig, axes = plt.subplots(1, 2, figsize=(13, 4), sharey=True)
    for ax, cfg, name in zip(axes, ['AS-IS', 'TB-S1-p15'], ['AS-IS', 'TO-BE S1 (p 0,15)']):
        g = d[d.cfg == cfg].set_index('act')[['wait', 'proc']].reindex(acts).fillna(0)
        ax.bar(acts, g.wait, label='Chờ (trung vị)', color='#e6a100')
        ax.bar(acts, g.proc, bottom=g.wait, label='Xử lý (trung vị)', color='#2f6db3')
        ax.set_title(name, fontsize=10)
        ax.tick_params(axis='x', labelsize=8)
    axes[0].set_ylabel('phút làm việc')
    axes[0].legend(fontsize=8)
    fig.suptitle(f'Chờ của trường và xử lý theo bước, seed {MAIN_SEED} (A13 đo riêng bằng trễ phát hiện quá hạn)',
                 fontsize=11, x=0.01, ha='left')
    fig.text(0.99, 0.01, LABEL, ha='right', fontsize=9, color='#c0392b')
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)


def fmt(v, col):
    if pd.isna(v):
        return '–'
    if col in RATE_COLS:
        return f'{v:.1%}'.replace('.', ',')
    if col == 'K9_rounds_mean':
        return f'{v:.2f}'.replace('.', ',')
    return f'{v:,.0f}'.replace(',', '.')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--out', default='out')
    ap.add_argument('--seeds', type=int, default=len(simulate.SEEDS))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(exist_ok=True)
    seeds = simulate.SEEDS[:args.seeds]
    log = pd.concat([simulate.simulate(c, s) for c in simulate.CONFIGS for s in seeds], ignore_index=True)
    main_log = log[(log.seed == MAIN_SEED) & log.cfg.isin(['AS-IS', 'TB-S1-p15'])]
    main_log.drop(columns=['t_min']).to_csv(out / f'eventlog_seed{MAIN_SEED}.csv', index=False)

    k = kpis(log)
    k.to_csv(out / 'kpi_by_seed.csv', index=False)
    agg, wins, diffs = summarize(k)
    agg.round(3).to_csv(out / 'kpi_summary.csv')
    wins.to_csv(out / 'kpi_wins_vs_asis.csv')
    diffs.to_csv(out / 'kpi_paired_diff.csv')

    lines = [f'# Kết quả Process Mining – {LABEL}', '',
             f'Seed chính {MAIN_SEED}; {len(seeds)} seed × {len(simulate.CONFIGS)} cấu hình; {simulate.N_CASES} hồ sơ/lần chạy. '
             'Đơn vị: phút làm việc (GA1, 450 phút/ngày). Không phải số đo tại trường.', '']
    show = list(simulate.CONFIGS)
    lines += ['## KPI: trung vị qua các seed (min–max)', '',
              '| KPI | ' + ' | '.join(show) + ' |', '|---|' + '---|' * len(show)]
    for col in [c for c in k.columns if c not in ('cfg', 'seed')]:
        cells = [f"{fmt(agg.at[c, (col, 'median')], col)} ({fmt(agg.at[c, (col, 'min')], col)}–{fmt(agg.at[c, (col, 'max')], col)})"
                 for c in show]
        lines.append(f'| {col} | ' + ' | '.join(cells) + ' |')
    lines += ['', f'## Số seed (trên {len(seeds)}) mà TO-BE tốt hơn AS-IS theo cặp', '', wins.to_markdown(), '',
              '## Hiệu theo cặp cùng seed: TO-BE − AS-IS, trung vị (min đến max); âm là tốt hơn', '', diffs.to_markdown(), '']
    nv = {cfg: normalized_variants(main_log[main_log.cfg == cfg]) for cfg in ('AS-IS', 'TB-S1-p15')}
    both = pd.concat({k2: v.share for k2, v in nv.items()}, axis=1).fillna(0).sort_values('AS-IS', ascending=False).head(6)
    lines += ['## Biến thể đã chuẩn hóa để so AS-IS/TO-BE (bỏ A15/A16, gộp A17 vào A06, gộp A10 vào A07)', '',
              (both * 100).round(1).to_markdown(), '']

    for cfg, name in (('AS-IS', 'AS-IS'), ('TB-S1-p15', 'TO-BE S1')):
        g = main_log[main_log.cfg == cfg]
        dfg, top, ver = pm4py_views(g)
        st = edge_stats(g)
        st.round(1).to_csv(out / f'edges_{cfg}.csv')
        plot_dfg(st, f'DFG {name}, seed {MAIN_SEED} (PM4Py {ver} discover_dfg; chờ tính bằng pandas)', out / f'dfg_{cfg}.png')
        lines += [f'## {name}: cạnh có trung vị chờ lớn nhất', '',
                  st.head(8)[['freq', 'cases', 'median', 'p90', 'over', 'color', 'phan_tan']].round(2).to_markdown(), '',
                  f'## {name}: top 5 biến thể (PM4Py)', '', '| Biến thể | Số ca | Tỷ lệ |', '|---|---|---|']
        lines += [f'| {v} | {c} | {p:.1%} |' for v, c, p in top]
        lines.append('')
    plot_kpis(k, out / 'kpi_compare.png')
    plot_wait_process(main_log, out / 'wait_process.png')
    (out / 'results.md').write_text('\n'.join(lines), encoding='utf-8')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
