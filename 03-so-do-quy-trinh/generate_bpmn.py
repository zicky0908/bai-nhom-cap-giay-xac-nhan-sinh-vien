"""Sinh sơ đồ BPMN 2.0 (AS-IS, TO-BE) theo bảng đặc tả mục 2 và mục 5 của báo cáo.

Đầu ra: *.bpmn (mở và chỉnh trong bpmn.io / Camunda Modeler) và *.png xem trước,
vẽ từ cùng bộ tọa độ. Sửa quy trình thì sửa bảng NODES/FLOWS rồi chạy lại.
"""
import sys
from pathlib import Path
from xml.sax.saxutils import escape

COL_W, X0, POOL_X, POOL_LABEL, LANE_LABEL = 150, 240, 100, 30, 30
SIZE = {'task': (120, 70), 'xor': (50, 50), 'evgw': (50, 50), 'start': (36, 36), 'end': (36, 36),
        'timer': (36, 36), 'msg': (36, 36)}
TAG = {'xor': 'exclusiveGateway', 'evgw': 'eventBasedGateway', 'start': 'startEvent', 'end': 'endEvent',
       'timer': 'intermediateCatchEvent', 'msg': 'intermediateCatchEvent'}
TASK_TAG = {'user': 'userTask', 'service': 'serviceTask', 'send': 'sendTask', 'manual': 'manualTask'}


def build(model):
    lanes, nodes = model['lanes'], {}
    y = 80
    lane_box = {}
    for lid, name, height, rows in lanes:
        lane_box[lid] = (y, height, rows)
        y += height
    pool_h = y - 80
    for nid, kind, name, lane, row, col, *extra in model['nodes']:
        top, _, rows = lane_box[lane]
        cx, cy = X0 + col * COL_W, top + rows[row]
        w, h = SIZE[kind]
        nodes[nid] = dict(id=nid, kind=kind, name=name, lane=lane, cx=cx, cy=cy, w=w, h=h,
                          task=extra[0] if extra else model.get('default_task', 'user'))
    width = X0 + (max(n['cx'] for n in nodes.values()) + 120 - X0) + 40 - POOL_X
    return lane_box, nodes, pool_h, width


def P(n, side):
    return {'L': (n['cx'] - n['w'] / 2, n['cy']), 'R': (n['cx'] + n['w'] / 2, n['cy']),
            'T': (n['cx'], n['cy'] - n['h'] / 2), 'B': (n['cx'], n['cy'] + n['h'] / 2)}[side]


def route(nodes, lane_box, flow):
    s, t = nodes[flow[0]], nodes[flow[1]]
    spec = flow[3] if len(flow) > 3 else 'auto'
    if spec == 'auto':
        (sx, sy), (tx, ty) = P(s, 'R'), P(t, 'L')
        if abs(sy - ty) < 1:
            return [(sx, sy), (tx, ty)]
        mx = tx - 20 if t['kind'] == 'task' else tx - 30
        return [(sx, sy), (mx, sy), (mx, ty), (tx, ty)]
    if spec == 'down' or spec == 'up':            # thẳng đứng rồi rẽ ngang vào cạnh trái đích
        a = P(s, 'B' if spec == 'down' else 'T')
        if abs(a[0] - t['cx']) < 1:
            return [a, P(t, 'T' if spec == 'down' else 'B')]
        return [a, (a[0], t['cy']), P(t, 'L')]
    kind, arg = spec                               # hành lang ngang ở độ cao y cho tuyến quay lui
    if kind == 'right_down':                       # đi phải một đoạn rồi thẳng đứng, vào cạnh trái đích
        a = P(s, 'R')
        x = a[0] + arg
        return [a, (x, a[1]), (x, t['cy']), P(t, 'L')]
    if kind == 'corridor':
        lane, dy = arg
        cy = lane_box[lane][0] + dy
        a = P(s, 'T') if cy < s['cy'] else P(s, 'B')
        b = P(t, 'T') if cy < t['cy'] else P(t, 'B')
        return [a, (a[0], cy), (b[0], cy), b]
    if kind == 'left_then':                        # sang trái theo hàng nguồn rồi vào đỉnh/đáy đích
        a = P(s, 'L')
        b = P(t, 'T') if t['cy'] > s['cy'] else P(t, 'B')
        return [a, (b[0], a[1]), b]
    raise ValueError(spec)


def label_at(pts, flow):
    """Vị trí nhãn đường nối: đầu đoạn thứ k (mặc định 0). Trả về (x, y, canh lề, dọc?)."""
    k = flow[4] if len(flow) > 4 else 0
    (x1, y1), (x2, y2) = pts[k], pts[k + 1]
    vertical, leftward = abs(x1 - x2) < 1, x2 < x1
    x = x1 + (5 if vertical else -6 if leftward else 6)
    y = y1 + (14 * (1 if y2 > y1 else -1) if vertical else -5)
    return x, y, 'right' if leftward and not vertical else 'left', vertical


def to_xml(model, lane_box, nodes, pool_h, width):
    pid = model['id']
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" '
           'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" '
           'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" '
           f'id="Defs_{pid}" targetNamespace="https://example.edu/student-certificate">',
           f'  <bpmn:collaboration id="Collab_{pid}">',
           f'    <bpmn:participant id="Pool_{pid}" name="{escape(model["pool"])}" processRef="Proc_{pid}" />',
           '  </bpmn:collaboration>',
           f'  <bpmn:process id="Proc_{pid}" isExecutable="false">',
           f'    <bpmn:laneSet id="LaneSet_{pid}">']
    for lid, name, *_ in model['lanes']:
        out.append(f'      <bpmn:lane id="{lid}_{pid}" name="{escape(name)}">')
        out += [f'        <bpmn:flowNodeRef>{n}</bpmn:flowNodeRef>' for n, v in nodes.items() if v['lane'] == lid]
        out.append('      </bpmn:lane>')
    out.append('    </bpmn:laneSet>')
    inc, outg = {}, {}
    for i, f in enumerate(model['flows']):
        outg.setdefault(f[0], []).append(f'F{i}')
        inc.setdefault(f[1], []).append(f'F{i}')
    for n in nodes.values():
        tag = TASK_TAG[n['task']] if n['kind'] == 'task' else TAG[n['kind']]
        body = [f'      <bpmn:incoming>{x}</bpmn:incoming>' for x in inc.get(n['id'], [])]
        body += [f'      <bpmn:outgoing>{x}</bpmn:outgoing>' for x in outg.get(n['id'], [])]
        if n['kind'] == 'timer':
            body.append(f'      <bpmn:timerEventDefinition id="TD_{n["id"]}" />')
        if n['kind'] == 'msg':
            body.append(f'      <bpmn:messageEventDefinition id="MD_{n["id"]}" />')
        out.append(f'    <bpmn:{tag} id="{n["id"]}" name="{escape(n["name"])}">')
        out += body
        out.append(f'    </bpmn:{tag}>')
    for i, f in enumerate(model['flows']):
        name = f' name="{escape(f[2])}"' if f[2] else ''
        out.append(f'    <bpmn:sequenceFlow id="F{i}" sourceRef="{f[0]}" targetRef="{f[1]}"{name} />')
    out += ['  </bpmn:process>', f'  <bpmndi:BPMNDiagram id="Diagram_{pid}">',
            f'    <bpmndi:BPMNPlane id="Plane_{pid}" bpmnElement="Collab_{pid}">',
            f'      <bpmndi:BPMNShape id="Pool_{pid}_di" bpmnElement="Pool_{pid}" isHorizontal="true">',
            f'        <dc:Bounds x="{POOL_X}" y="80" width="{width}" height="{pool_h}" />',
            '      </bpmndi:BPMNShape>']
    for lid, name, *_ in model['lanes']:
        top, h, _ = lane_box[lid]
        out += [f'      <bpmndi:BPMNShape id="{lid}_{pid}_di" bpmnElement="{lid}_{pid}" isHorizontal="true">',
                f'        <dc:Bounds x="{POOL_X + POOL_LABEL}" y="{top}" width="{width - POOL_LABEL}" height="{h}" />',
                '      </bpmndi:BPMNShape>']
    for n in nodes.values():
        x, y = n['cx'] - n['w'] / 2, n['cy'] - n['h'] / 2
        out += [f'      <bpmndi:BPMNShape id="{n["id"]}_di" bpmnElement="{n["id"]}">',
                f'        <dc:Bounds x="{x:.0f}" y="{y:.0f}" width="{n["w"]}" height="{n["h"]}" />']
        if n['kind'] in ('xor', 'evgw'):                # tên gateway trên-trái, như ảnh xem trước
            out += ['        <bpmndi:BPMNLabel>',
                    f'          <dc:Bounds x="{n["cx"] - 118:.0f}" y="{y - 30:.0f}" width="110" height="27" />',
                    '        </bpmndi:BPMNLabel>']
        elif n['kind'] == 'msg':
            out += ['        <bpmndi:BPMNLabel>',
                    f'          <dc:Bounds x="{n["cx"] + 24:.0f}" y="{n["cy"] - 14:.0f}" width="110" height="27" />',
                    '        </bpmndi:BPMNLabel>']
        elif n['kind'] != 'task':
            out += ['        <bpmndi:BPMNLabel>',
                    f'          <dc:Bounds x="{n["cx"] - 55:.0f}" y="{y + n["h"] + 4:.0f}" width="110" height="27" />',
                    '        </bpmndi:BPMNLabel>']
        out.append('      </bpmndi:BPMNShape>')
    for i, f in enumerate(model['flows']):
        pts = route(nodes, lane_box, f)
        out.append(f'      <bpmndi:BPMNEdge id="F{i}_di" bpmnElement="F{i}">')
        out += [f'        <di:waypoint x="{x:.0f}" y="{y:.0f}" />' for x, y in pts]
        if f[2]:
            x, y, align, vertical = label_at(pts, f)
            w = 7 * len(f[2])
            lx = x - w if align == 'right' else x
            ly = y - 7 if vertical else y - 12
            out += ['        <bpmndi:BPMNLabel>', f'          <dc:Bounds x="{lx:.0f}" y="{ly:.0f}" width="{w}" height="14" />',
                    '        </bpmndi:BPMNLabel>']
        out.append('      </bpmndi:BPMNEdge>')
    out += ['    </bpmndi:BPMNPlane>', '  </bpmndi:BPMNDiagram>', '</bpmn:definitions>', '']
    return '\n'.join(out)


def to_png(model, lane_box, nodes, pool_h, width, path):
    import textwrap
    import matplotlib.pyplot as plt
    from matplotlib.patches import Circle, FancyBboxPatch, Polygon, Rectangle
    fig, ax = plt.subplots(figsize=(width / 95, (pool_h + 60) / 95))
    ax.set_xlim(POOL_X - 5, POOL_X + width + 5)
    ax.set_ylim(80 + pool_h + 30, 40)
    ax.axis('off')
    ax.add_patch(Rectangle((POOL_X, 80), width, pool_h, fill=False, lw=1.2))
    ax.text(POOL_X + 15, 80 + pool_h / 2, model['pool'], rotation=90, ha='center', va='center', fontsize=9, weight='bold')
    for lid, name, *_ in model['lanes']:
        top, h, _ = lane_box[lid]
        ax.add_patch(Rectangle((POOL_X + POOL_LABEL, top), width - POOL_LABEL, h, fill=False, lw=0.8))
        ax.text(POOL_X + POOL_LABEL + 15, top + h / 2, '\n'.join(textwrap.wrap(name, 22)),
                rotation=90, ha='center', va='center', fontsize=8)
    for f in model['flows']:
        pts = route(nodes, lane_box, f)
        xs, ys = zip(*pts)
        ax.plot(xs, ys, color='#555', lw=1)
        ax.annotate('', xy=pts[-1], xytext=pts[-2], arrowprops=dict(arrowstyle='-|>', color='#555', lw=1))
        if f[2]:
            x, y, align, vertical = label_at(pts, f)
            ax.text(x, y, f[2], fontsize=6.5, color='#333', va='center' if vertical else 'baseline', ha=align)
    for n in nodes.values():
        cx, cy, w, h = n['cx'], n['cy'], n['w'], n['h']
        if n['kind'] == 'task':
            fc = '#eef3fb' if n['task'] in ('service', 'send') else 'white'
            ax.add_patch(FancyBboxPatch((cx - w / 2, cy - h / 2), w, h, boxstyle='round,pad=0,rounding_size=8',
                                        fc=fc, ec='#333', lw=1))
            ax.text(cx, cy, '\n'.join(textwrap.wrap(n['name'], 19)), ha='center', va='center', fontsize=6.8)
            continue
        if n['kind'] in ('xor', 'evgw'):
            ax.add_patch(Polygon([(cx - 25, cy), (cx, cy - 25), (cx + 25, cy), (cx, cy + 25)], fc='white', ec='#333'))
            ax.text(cx, cy, 'X' if n['kind'] == 'xor' else '⬠', ha='center', va='center', fontsize=9)
            # tên gateway đặt trên-trái: các nhánh ra dùng cạnh phải, đáy và đỉnh (đường thẳng đứng tại cx)
            ax.text(cx - 8, cy - 26, '\n'.join(textwrap.wrap(n['name'], 12)), ha='right', va='bottom', fontsize=6.5)
            continue
        else:
            lw = 2.5 if n['kind'] == 'end' else 1
            ax.add_patch(Circle((cx, cy), 18, fc='white', ec='#333', lw=lw))
            if n['kind'] in ('timer', 'msg'):
                ax.add_patch(Circle((cx, cy), 14, fill=False, ec='#333', lw=0.8))
                ax.text(cx, cy, '◷' if n['kind'] == 'timer' else '✉', ha='center', va='center', fontsize=8)
        if n['kind'] == 'msg':                      # đường vào đi từ dưới lên: tên đặt bên phải
            ax.text(cx + 24, cy, '\n'.join(textwrap.wrap(n['name'], 18)), ha='left', va='center', fontsize=6.5)
        else:
            ax.text(cx, cy + h / 2 + 6, '\n'.join(textwrap.wrap(n['name'], 20)), ha='center', va='top', fontsize=6.5)
    fig.savefig(path, dpi=130, bbox_inches='tight')
    plt.close(fig)


AS_IS = dict(
    id='asis', pool='AS-IS: cấp giấy xác nhận sinh viên (giả định)',
    default_task='manual',                          # AS-IS làm tay trên sổ và phiếu trình, chưa có hệ thống
    lanes=[('L1', 'L1 Sinh viên', 140, [70]), ('L2', 'L2 Cán bộ CTHSSV', 240, [65, 175]),
           ('L3', 'L3 Lãnh đạo phòng', 140, [70]), ('L4', 'L4 Văn thư', 140, [70])],
    nodes=[
        ('S0', 'start', 'Cần giấy xác nhận', 'L1', 0, 0),
        ('A01', 'task', 'A01 Nộp yêu cầu (đơn giấy/form)', 'L1', 0, 1, 'manual'),
        ('A02', 'task', 'A02 Tiếp nhận, ghi sổ, gán số', 'L2', 0, 2),
        ('A03', 'task', 'A03 Kiểm tra thông tin và tư cách', 'L2', 0, 3),
        ('G1', 'xor', 'Kết quả kiểm tra?', 'L2', 0, 4),
        ('A04', 'task', 'A04 Báo SV bổ sung (mục thiếu, hạn)', 'L2', 1, 5),
        ('G3', 'evgw', 'Chờ SV hoặc hết hạn', 'L2', 1, 6),
        ('A05', 'msg', 'A05 SV nộp bổ sung', 'L1', 0, 6),
        ('T1', 'timer', 'Hết hạn 7 ngày LV (phát hiện khi rà thứ Sáu)', 'L2', 1, 7),
        ('A13', 'task', 'A13 Đóng hồ sơ quá hạn, báo SV', 'L2', 1, 8),
        ('E3', 'end', 'E3 Đóng do quá hạn', 'L2', 1, 9),
        ('A06', 'task', 'A06 Soạn giấy và phiếu trình', 'L2', 0, 8),
        ('A07', 'task', 'A07 Xem xét, quyết định, ký', 'L3', 0, 9),
        ('G2', 'xor', 'Quyết định?', 'L3', 0, 10),
        ('A08', 'task', 'A08 Đóng dấu, vào sổ', 'L4', 0, 11, 'manual'),
        ('A10', 'task', 'A10 Ghi lý do từ chối', 'L3', 0, 11),
        ('A09', 'task', 'A09 Xác nhận đã cấp', 'L2', 0, 12),
        ('A11', 'task', 'A11 Báo SV có giấy, hẹn nhận', 'L2', 0, 13),
        ('A14', 'task', 'A14 Báo SV bị từ chối kèm lý do', 'L2', 1, 12),
        ('E2', 'end', 'E2 Bị từ chối', 'L2', 1, 13),
        ('A12', 'task', 'A12 SV nhận giấy', 'L1', 0, 14, 'manual'),
        ('E1', 'end', 'E1 Đã nhận giấy', 'L1', 0, 15),
    ],
    flows=[
        ('S0', 'A01', ''), ('A01', 'A02', ''), ('A02', 'A03', ''), ('A03', 'G1', ''),
        ('G1', 'A06', 'Đủ'), ('G1', 'A04', 'Thiếu/sai', 'down'),
        ('G1', 'A07', 'Không đủ tư cách', ('right_down', 40), 2),
        ('A04', 'G3', ''), ('G3', 'A05', '', 'up'), ('G3', 'T1', ''), ('T1', 'A13', ''), ('A13', 'E3', ''),
        ('A05', 'A03', 'Nộp lại', ('left_then', None)),
        ('A06', 'A07', ''), ('A07', 'G2', ''), ('G2', 'A08', 'Duyệt', 'down'), ('G2', 'A10', 'Từ chối'),
        ('G2', 'A06', 'Trả lại (chỉ khi từ A03)', ('corridor', ('L2', 14)), 1),
        ('A08', 'A09', ''), ('A09', 'A11', ''), ('A11', 'A12', ''), ('A12', 'E1', ''),
        ('A10', 'A14', '', 'up'), ('A14', 'E2', ''),
    ])

TO_BE = dict(
    id='tobe', pool='TO-BE: cấp giấy xác nhận sinh viên (đề xuất)',
    lanes=[('L1', 'L1 Sinh viên', 140, [70]), ('L2', 'L2 Cán bộ CTHSSV', 140, [70]),
           ('L3', 'L3 Lãnh đạo phòng', 140, [70]), ('L4', 'L4 Văn thư', 140, [70]),
           ('L5', 'L5 Hệ thống (web + n8n)', 320, [60, 160, 260])],
    nodes=[
        ('S0', 'start', 'Cần giấy xác nhận', 'L1', 0, 0),
        ('A01', 'task', 'A01 Nộp form web theo checklist', 'L1', 0, 1),
        ('A15', 'task', 'A15 Kiểm tra định dạng tự động', 'L5', 0, 2, 'service'),
        ('G0', 'xor', 'Hợp lệ?', 'L5', 0, 3),
        ('EF', 'end', 'Báo lỗi trên form, không tạo hồ sơ', 'L5', 2, 3),
        ('A02', 'task', 'A02 Tạo mã hồ sơ, email xác nhận', 'L5', 0, 4, 'service'),
        ('A03', 'task', 'A03 Kiểm tra tư cách theo checklist', 'L2', 0, 5),
        ('G1', 'xor', 'Kết quả kiểm tra?', 'L2', 0, 6),
        ('A04', 'task', 'A04 Chọn mục thiếu (hệ thống gửi email)', 'L2', 0, 7),
        ('A06', 'task', 'A06 Sinh giấy từ mẫu', 'L5', 0, 7, 'service'),
        # A05 là hành động của SV (L1, R7). Cột 8 và 10 để trống ở L2–L4 cho hai đường G3/G3b lên L1.
        ('G3', 'evgw', 'Chờ SV hoặc mốc hạn', 'L5', 1, 8),
        ('M1', 'msg', 'A05 SV nộp bổ sung qua link', 'L1', 0, 8),
        ('T1', 'timer', 'Còn 2 ngày LV', 'L5', 2, 8),
        ('A16', 'task', 'A16 Nhắc hạn (1 lần/vòng)', 'L5', 2, 9, 'send'),
        ('G3b', 'evgw', 'Chờ SV hoặc đến hạn', 'L5', 2, 10),
        ('M2', 'msg', 'A05 SV nộp bổ sung (sau nhắc)', 'L1', 0, 10),
        ('T2', 'timer', 'Đến hạn bổ sung', 'L5', 2, 11),
        ('A13', 'task', 'A13 Đóng hồ sơ quá hạn, gửi email', 'L5', 2, 12, 'service'),
        ('E3', 'end', 'E3 Đóng do quá hạn', 'L5', 2, 13),
        ('A17', 'task', 'A17 Rà giấy', 'L2', 0, 9),
        ('A07', 'task', 'A07 Duyệt, ký (khung 10:30 và 16:00)', 'L3', 0, 11),
        ('G2', 'xor', 'Quyết định?', 'L3', 0, 12),
        ('A08', 'task', 'A08 Đóng dấu (được báo ngay)', 'L4', 0, 13, 'manual'),
        ('A14', 'task', 'A14 Email từ chối kèm lý do (Mailpit)', 'L5', 0, 13, 'send'),
        ('E2', 'end', 'E2 Bị từ chối', 'L5', 0, 14),
        ('A09', 'task', 'A09 Xác nhận đã cấp', 'L2', 0, 14),
        ('A11', 'task', 'A11 Email báo có giấy (Mailpit)', 'L5', 0, 15, 'send'),
        ('A12', 'task', 'A12 SV nhận giấy', 'L1', 0, 16, 'manual'),
        ('E1', 'end', 'E1 Đã nhận giấy', 'L1', 0, 17),
    ],
    flows=[
        ('S0', 'A01', ''), ('A01', 'A15', ''), ('A15', 'G0', ''), ('G0', 'EF', 'Lỗi', 'down'),
        ('G0', 'A02', 'Đạt'), ('A02', 'A03', ''), ('A03', 'G1', ''),
        ('G1', 'A06', 'Đủ'), ('G1', 'A04', 'Thiếu', ('corridor', ('L2', 14)), 1),
        ('G1', 'A07', 'Không đủ tư cách', 'down'),
        ('A04', 'G3', ''), ('G3', 'M1', '', 'up'), ('G3', 'T1', '', 'down'), ('T1', 'A16', ''), ('A16', 'G3b', ''),
        ('G3b', 'M2', '', 'up'), ('G3b', 'T2', ''), ('T2', 'A13', ''), ('A13', 'E3', ''),
        ('M1', 'A03', 'Nộp lại', ('corridor', ('L1', 20)), 1), ('M2', 'A03', '', ('corridor', ('L1', 20))),
        ('A06', 'A17', ''), ('A17', 'A07', ''), ('A07', 'G2', ''),
        ('G2', 'A08', 'Duyệt'), ('G2', 'A14', 'Từ chối (bắt buộc lý do)', 'down', 0),
        ('G2', 'A06', 'Trả lại (chỉ khi từ A03)', ('corridor', ('L3', 12)), 1),
        ('A14', 'E2', ''), ('A08', 'A09', ''), ('A09', 'A11', ''), ('A11', 'A12', ''), ('A12', 'E1', ''),
    ])


def main(out_dir='.'):
    out = Path(out_dir)
    for model, name in ((AS_IS, 'as-is'), (TO_BE, 'to-be')):
        built = build(model)
        (out / f'{name}.bpmn').write_text(to_xml(model, *built), encoding='utf-8')
        to_png(model, *built, out / f'{name}.png')
        print(name, len(model['nodes']), 'nodes', len(model['flows']), 'flows')


if __name__ == '__main__':
    main(*sys.argv[1:])
