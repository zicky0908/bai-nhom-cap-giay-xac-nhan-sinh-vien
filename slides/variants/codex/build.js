const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Codex';
pres.subject = 'Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên';
pres.title = 'Cấp giấy xác nhận sinh viên — từ phân tích đến tự động hóa';
pres.company = 'Nhóm nghiên cứu học thuật';
pres.lang = 'vi-VN';
pres.theme = {headFontFace:'Arial',bodyFontFace:'Arial',lang:'vi-VN'};
const W=13.333333,H=7.5;
const C={paper:'F5F3ED',navy:'122D3A',teal:'007F79',mint:'DFEFEB',orange:'CB6338',sand:'F3E4D8',ink:'193541',gray:'526771',line:'D6DED9',white:'FFFFFF',red:'B34735'};
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const textAudit=[];const previews=[];let s,parts,idx=0;
const xml=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function rect(x,y,w,h,fill,stroke=fill,r=0){s.addShape(r?pres.ShapeType.roundRect:pres.ShapeType.rect,{x,y,w,h,rectRadius:r,fill:{color:fill},line:{color:stroke,width:.7},radius:r});parts.push(`<rect x="${x*120}" y="${y*120}" width="${w*120}" height="${h*120}" rx="${r*120}" fill="#${fill}" stroke="#${stroke}"/>`);}
function txt(t,x,y,w,h,size=18,color=C.ink,bold=false,extra={}){textAudit.push({slide:idx,t,x,y,w,h,size});s.addText(t,{x,y,w,h,fontFace:'Arial',fontSize:size,color,bold,margin:0,breakLine:false,paraSpaceAfterPt:0,valign:'mid',...extra});const rows=String(t).split('\n'),line=size*1.84;let baseline=y*120+(h*120-rows.length*line)/2+size*1.34;rows.forEach((v,i)=>{let align=extra.align||'left',xx=(align==='center'?x+w/2:align==='right'?x+w:x)*120;parts.push(`<text x="${xx}" y="${baseline+i*line}" font-family="Arial,DejaVu Sans" font-size="${size*1.667}" font-weight="${bold?700:400}" fill="#${color}" text-anchor="${align==='center'?'middle':align==='right'?'end':'start'}">${xml(v)}</text>`);});}
function line(x1,y1,x2,y2,color=C.teal,arrow=false,width=1.5){s.addShape(pres.ShapeType.line,{x:Math.min(x1,x2),y:Math.min(y1,y2),w:Math.abs(x2-x1),h:Math.abs(y2-y1),flipH:x2<x1,flipV:y2<y1,line:{color,width,beginArrowType:'none',endArrowType:arrow?'triangle':'none'}});parts.push(`<line x1="${x1*120}" y1="${y1*120}" x2="${x2*120}" y2="${y2*120}" stroke="#${color}" stroke-width="${width*1.4}"/>`);}
function pill(t,x,y,w,fill=C.mint,color=C.teal){rect(x,y,w,.34,fill);txt(t,x+.09,y,w-.18,.34,14,color,true);}
function begin(section,title,sub='',sim=false,dark=false){s=pres.addSlide();parts=[];idx++;s.background={color:dark?C.navy:C.paper};rect(.0,0,.13,H,C.teal);txt(section.toUpperCase(),.48,.27,9,.3,14,dark?'8DD3C7':C.teal,true);txt(title,.48,.86,12.3,.92,30,dark?C.white:C.navy,true);if(sub)txt(sub,.5,1.85,12.2,.56,18,dark?'D2E3E6':C.gray);line(.5,7.03,12.82,7.03,dark?'47616B':C.line,false,.7);txt('CAO ĐẲNG Y DƯỢC  /  PROTOTYPE HỌC THUẬT',.5,7.12,9,.22,11,dark?'B7CED2':C.gray);txt(String(idx).padStart(2,'0'),12.15,7.09,.65,.28,12,dark?'B7CED2':C.gray,true,{align:'right'});if(sim)pill('Dữ liệu mô phỏng',10.2,.25,2.6,C.sand,C.red);}
function note(t){s.addNotes(t);previews.push({parts:[...parts],bg:s.background.color});}
function card(x,y,w,h,title,body,accent=C.teal){rect(x,y,w,h,C.white);rect(x,y,.06,h,accent);txt(title,x+.22,y+.15,w-.42,.42,20,accent,true);txt(body,x+.22,y+.77,w-.42,h-.93,17);}
function banner(t,y=6.27,color=C.teal){rect(.5,y,12.3,.5,color);txt(t,.7,y+.02,11.9,.45,17,C.white,true);}
function image(p,x,y,w,h){const buf=fs.readFileSync(p);const iw=buf.readUInt32BE(16),ih=buf.readUInt32BE(20),ratio=Math.min(w/iw,h/ih),dw=iw*ratio,dh=ih*ratio;s.addImage({path:p,x:x+(w-dw)/2,y:y+(h-dh)/2,w:dw,h:dh});parts.push(`<image href="data:image/png;base64,${buf.toString('base64')}" x="${x*120}" y="${y*120}" width="${w*120}" height="${h*120}" preserveAspectRatio="xMidYMid meet"/>`);}
function cell(t,x,y,w,h,{fill=C.white,color=C.ink,bold=false,size=16}={}){rect(x,y,w,h,fill,C.paper);txt(t,x+.14,y+.07,w-.28,h-.14,size,color,bold);}
function stat(n,label,x,y,w,accent=C.teal){txt(n,x,y,w,.68,35,accent,true);txt(label,x,y+.76,w,.65,16,C.gray);}
function flowbox(t,x,y,w=2.05,fill=C.mint){rect(x,y,w,.66,fill);txt(t,x+.1,y+.06,w-.2,.54,17,C.navy,true,{align:'center'});}
const img=n=>path.join(__dirname,'inputs/images',n);
async function build(){
// 1
begin('Nghiên cứu quy trình','Cấp giấy xác nhận sinh viên','Phân tích quy trình và thiết kế tự động hóa tại trường cao đẳng Y Dược',false,true);
txt('TỪ HỒ SƠ\nĐẾN KẾT QUẢ\nCÓ THỂ THEO DÕI',.55,2.7,6.4,2.0,35,C.white,true);
txt('Phân tích điểm nghẽn → thiết kế lại → prototype',.57,5.1,6.6,.6,18,'B7D9D6');
rect(7.7,2.7,5.05,3.36,'1D414D');txt('PHẠM VI GIẤY XÁC NHẬN',7.98,2.94,4.5,.4,16,'8DD3C7',true);
['Đang học','Hoãn nghĩa vụ quân sự','Vay vốn','Học bổng'].forEach((v,i)=>{txt('•  '+v,8.02,3.55+i*.49,4.4,.4,20,C.white);});
rect(.55,6.21,12.2,.52,'264B56');txt('Thử nghiệm học thuật • Dữ liệu mô phỏng • Không phát hành giấy có giá trị pháp lý',.72,6.23,11.9,.46,16,C.white);
note('Người trình bày: TV1. Giới thiệu đề tài và phạm vi bốn loại giấy: xác nhận đang học, hoãn nghĩa vụ quân sự, vay vốn và học bổng. Nhóm có bốn thành viên; TV1 phụ trách bài toán và giới hạn, TV2 mô hình quy trình, TV3 dữ liệu và khai phá, TV4 prototype và đánh giá. Bối cảnh trường là giả định học thuật. Mục tiêu là dùng phân tích quy trình để chọn chỗ cần thay đổi, rồi hiện thực một phần bằng prototype. Toàn bộ số liệu Process Mining là mô phỏng, không phải đo tại trường. Prototype không phát hành giấy có giá trị pháp lý.');
// 2
begin('Bài toán nghiệp vụ','Thiếu trạng thái, chờ lâu, khó phát hiện hồ sơ tồn','Các vấn đề được đặt dưới dạng giả thuyết học thuật để kiểm chứng.');
const probs=[['Không tra được tiến độ','Cấp mã hồ sơ và trạng thái rõ ràng'],['Thiếu thông tin phát hiện muộn','Kiểm tra biểu mẫu ngay khi nộp'],['Trình ký theo đợt gây chờ','Đo riêng chờ ký và thao tác'],['Quá hạn chỉ lộ khi rà sổ','Nhắc hạn và phát hiện đúng thời điểm'],['Thông báo không lưu vết','Lưu bằng chứng gửi và lý do']];
probs.forEach((a,i)=>{let y=2.62+i*.66;rect(.5,y,12.3,.56,i%2?C.white:C.mint);txt(a[0],.7,y,5.2,.56,18,C.navy,true);txt('→',6.1,y,.45,.56,18,C.teal,true);txt(a[1],6.7,y,5.8,.56,17);});
txt('Sinh viên  →  Cán bộ CTHSSV  →  Lãnh đạo ký  →  Văn thư',.68,6.28,12,.42,18,C.teal,true);
note('Người trình bày: TV1. Đi lần lượt từ trải nghiệm của sinh viên sang công việc của cán bộ. Sinh viên không có trạng thái để tự tra cứu nên phải hỏi lại. Cán bộ có thể phát hiện thiếu thông tin muộn, mất thời gian rà sổ và chuyển giấy. Đặt năm mục tiêu tương ứng như trên slide, đây là mục tiêu dự kiến chứ chưa phải hiệu quả thực tế. Thông báo có lưu vết chỉ đo được ở TO-BE vì AS-IS không có nguồn dữ liệu tương ứng; không dùng chỉ số này để so sánh hai kịch bản. Giới thiệu bốn vai trò xuyên suốt bài.');
// 3
begin('Phạm vi đầu–cuối','Một đầu vào, các kết cục rõ ràng','Tách thời gian phía trường khỏi thời gian sinh viên chờ nhận giấy.');
card(.5,2.63,3.05,2.15,'Đầu vào','Thông tin sinh viên\nLoại giấy, mục đích\nSố bản, email, minh chứng');
flowbox('Tiếp nhận và xử lý',4.0,3.32,3.55);line(3.58,3.65,3.94,3.65,C.teal,true);
const ends=[['Nhận giấy',C.mint],['Từ chối có lý do',C.sand],['Đóng do quá hạn bổ sung',C.white]];ends.forEach((a,i)=>{flowbox(a[0],8.15,2.65+i*.83,4.65,a[1]);});line(7.6,3.65,8.05,3.65,C.teal,true);
rect(.5,5.23,12.3,1.32,C.navy);txt('T_trường',.74,5.4,1.8,.36,21,'8DD3C7',true);txt('Từ nộp yêu cầu đến thông báo kết quả hoặc đóng hồ sơ',2.8,5.35,9.6,.45,18,C.white);txt('T_SV',.74,5.98,1.8,.36,21,'8DD3C7',true);txt('Từ nộp yêu cầu đến nhận giấy; chỉ tính hồ sơ đã nhận',2.8,5.94,9.6,.45,18,C.white);
note('Người trình bày: TV1. Trình bày theo SIPOC: sinh viên cung cấp dữ liệu; phòng CTHSSV xử lý cùng lãnh đạo và văn thư; sinh viên hoặc cơ quan nhận giấy là bên sử dụng kết quả. Ngoài giấy hoặc thông báo từ chối còn có nhật ký sự kiện. Ba kết cục là nhận giấy, từ chối có lý do và đóng do quá hạn bổ sung. T_trường kết thúc khi sinh viên được thông báo, không phải khi nội bộ mới đóng dấu xong. T_SV chỉ tính hồ sơ đã nhận giấy. Các hồ sơ đã cấp nhưng chưa nhận là dữ liệu bị cắt, báo cáo riêng số lượng và tuổi, không tự đóng. Ngoài phạm vi: ký số, giá trị pháp lý, tích hợp cơ sở dữ liệu trường và cấp lại.');
// 4
begin('AS-IS • Giả định nghiệp vụ','Quy trình thủ công tạo vòng lặp và thời gian chờ','Các vai trò bàn giao hồ sơ; việc quá hạn được rà thủ công vào chiều thứ Sáu.');
const laneNames=['Sinh viên','Cán bộ CTHSSV','Lãnh đạo','Văn thư'];
laneNames.forEach((v,i)=>{let y=2.62+i*.81;rect(.5,y,12.3,.81,i%2?C.white:'EAF0EB',C.line);txt(v,.63,y+.11,1.68,.56,15,C.teal,true);line(2.32,y,2.32,y+.81,C.line,false,.6);});
function asnode(t,x,row,w=1.9,fill=C.white){rect(x,2.73+row*.81,w,.58,fill,C.line);txt(t,x+.06,2.75+row*.81,w-.12,.54,14,C.navy,true,{align:'center'});}
asnode('Nộp đơn',2.55,0,1.6);asnode('Bổ sung',5.06,0,1.74,C.sand);asnode('Nhận giấy',10.67,0,1.86,C.mint);
asnode('Ghi sổ / kiểm tra',3.27,1,2.33);asnode('Soạn / trình ký',6.18,1,2.1);asnode('Báo kết quả',10.42,1,2.11);
asnode('Duyệt / từ chối, ký',7.2,2,2.63);asnode('Đóng dấu / vào sổ',9.64,3,2.89);
line(3.35,3.32,3.35,3.51,C.teal,true);line(5.63,3.83,6.14,3.83,C.teal,true);line(7.24,4.13,7.24,4.32,C.teal,true);line(9.31,4.95,9.75,5.14,C.teal,true);line(12.65,5.45,12.65,3.84,C.teal);line(12.65,3.84,12.56,3.84,C.teal,true);line(11.5,3.53,11.5,3.34,C.teal,true);
line(5.12,3.52,5.12,3.33,C.orange,true);line(5.9,3.3,5.9,3.45,C.orange);line(5.9,3.45,4.4,3.45,C.orange);line(4.4,3.45,4.4,3.52,C.orange,true);
rect(.5,6.13,12.3,.62,C.sand);txt('Thiếu → bổ sung và kiểm tra lại   •   Không đủ điều kiện → trình từ chối   •   Quá hạn → rà chiều thứ Sáu',.66,6.19,11.98,.49,15,C.red,true);
note('Người trình bày: TV2. Sơ đồ trên slide rút gọn BPMN as-is.png thành các bước lớn theo bốn làn để dễ đọc khi chiếu. Dẫn theo luồng nộp, kiểm tra, trình ký, đóng dấu và báo kết quả. Sinh viên nộp; cán bộ ghi sổ, kiểm tra điều kiện; đủ thì soạn và trình ký; lãnh đạo quyết định; văn thư đóng dấu; sau đó cán bộ thông báo. Sau kiểm tra có nhánh đủ điều kiện, yêu cầu bổ sung hoặc trình từ chối. Chỉ lãnh đạo quyết định từ chối. Nhánh bổ sung quay lại kiểm tra và AS-IS không giới hạn số vòng. Hết hạn bổ sung không đồng nghĩa đã phát hiện: mô hình giả định rà chiều thứ Sáu nên có khoảng trễ. Mô hình này là giả định nghiên cứu, chưa phải quy trình được xác minh tại một trường cụ thể.');
// 5
begin('Giả thuyết điểm nghẽn','Kiểm chứng các vị trí gây trễ trên cùng tiêu chí','Chưa xếp hạng nguyên nhân trước khi xem dữ liệu.');
[['Chờ trình ký','Ký theo đợt, người ký vắng','Kéo dài thời gian phía trường'],['Vòng bổ sung','Biểu mẫu và yêu cầu chưa rõ','Làm lại; nguy cơ hồ sơ bị đóng'],['Chờ kiểm tra đầu vào','Cán bộ kiêm nhiệm, tra cứu thủ công','Tồn hồ sơ trước bước kiểm tra'],['Chờ chuyển sang đóng dấu','Chuyển giấy theo lô, thiếu đầu mối','Giấy đã ký vẫn chưa đến sinh viên']].forEach((a,i)=>{let x=.5+(i%2)*6.25,y=2.6+Math.floor(i/2)*1.35;rect(x,y,6.05,1.19,C.white);rect(x,y,.06,1.19,C.teal);txt(a[0],x+.22,y+.1,5.61,.34,20,C.teal,true);txt(a[1]+'\n'+a[2],x+.22,y+.51,5.61,.59,16);});
rect(.5,5.6,12.3,1.13,C.navy);txt('Tiêu chí công bố trước',.74,5.74,3.1,.4,19,'8DD3C7',true);txt('Top 3 thời gian chờ • Ít nhất một nửa số ca vượt ngưỡng\nCó bằng chứng nguyên nhân • Tính theo giờ làm việc',4.1,5.73,8.3,.79,17,C.white);
note('Người trình bày: TV2. Bốn giả thuyết ngang hàng: chờ ký, vòng bổ sung, chờ kiểm tra và chờ bàn giao từ ký sang đóng dấu. Tách vòng bổ sung thành thời gian của trường trước yêu cầu, thời gian sinh viên phản hồi và thời gian trường kiểm tra lại. Tiêu chí công bố trước: trung vị thuộc top ba chuyển tiếp chờ, ít nhất một nửa số ca vượt ngưỡng và có bằng chứng lịch, lô hoặc mã lý do. Chỉ hai tiêu chí thời gian thì gọi là ứng viên nghẽn; chưa đủ để kết luận nguyên nhân. So trung vị với P90 để tránh bị ngoại lai chi phối. Chỉ dùng phút làm việc, không gọi nghỉ trưa hay cuối tuần là nghẽn.');
// 6
begin('Thiết kế phép so sánh','Ghép cặp hồ sơ để giảm nhiễu giữa các kịch bản','Giữ cùng cơ sở ngẫu nhiên; chỉ thay những giả định cần đánh giá.',true);
stat('400','hồ sơ mỗi lần mô phỏng',.6,2.62,3.7);stat('12 + 8','tuần đến + tuần xả hàng',4.85,2.62,3.6);stat('20','hạt giống ngẫu nhiên độc lập',9.15,2.62,3.6);
card(.5,4.3,5.95,1.62,'Giữ cố định','Loại giấy; hành vi sinh viên\nCùng luồng ngẫu nhiên cho từng cặp hồ sơ');
card(6.65,4.3,6.15,1.62,'Thay đổi có kiểm soát','Tự động hóa; lịch ký; kiểm tra đầu vào\nThử thêm kịch bản tỷ lệ bổ sung giữ nguyên',C.orange);
banner('Đơn vị: phút làm việc • Một ngày làm việc = 450 phút',6.25);
note('Người trình bày: TV3. Mỗi lần mô phỏng có 400 hồ sơ đến trong 12 tuần, thêm 8 tuần để xả hàng. Lặp 20 hạt giống độc lập. Một ngày có 450 phút làm việc theo lịch giả định. Ghép cặp cùng hồ sơ giữa AS-IS và TO-BE bằng cùng luồng ngẫu nhiên để khác biệt bớt do may rủi. Giữ tỷ lệ loại giấy và hành vi sinh viên. Thay tự động hóa, lịch ký và tham số kiểm tra đầu vào. S0 vẫn ký theo lô, S1 ký hai lần mỗi ngày; thử thêm S1 nhưng tỷ lệ bổ sung không giảm. Mục đích là phân biệt hiệu ứng phần mềm với hiệu ứng tổ chức công việc. Tất cả tham số là giả định, chưa hiệu chỉnh bằng nhật ký thực tế.');
// 7
begin('Khai phá quy trình','Chờ trình ký nổi bật trong bản đồ AS-IS','Sơ đồ luồng rút gọn từ DFG; tách thời gian của sinh viên khỏi phần phía trường.',true);
pill('AS-IS',.5,2.55,1.3);pill('TO-BE S1',6.76,2.55,1.7);
// Readable reduction of the supplied DFG; known values only.
for(let side=0;side<2;side++){let x=.5+side*6.26;rect(x,3.02,6.03,2.5,C.white);let yy=3.49;
[['Kiểm tra',x+.18,1.35],['Trình ký',x+2.03,1.35],['Duyệt ký',x+4.03,1.72]].forEach(a=>{rect(a[1],yy,a[2],.58,C.mint);txt(a[0],a[1]+.05,yy+.04,a[2]-.1,.5,14,C.navy,true,{align:'center'});});
line(x+1.56,yy+.29,x+1.99,yy+.29,C.teal,true,2);line(x+3.42,yy+.29,x+3.99,yy+.29,side?C.teal:C.red,true,3);
txt(side?'123 phút':'621 phút',x+3.1,4.21,2.5,.42,20,side?C.teal:C.red,true,{align:'center'});
rect(x+.26,4.57,1.97,.49,C.sand);txt('Yêu cầu bổ sung',x+.32,4.62,1.85,.38,14,C.red,true,{align:'center'});line(x+.93,4.1,x+.93,4.53,C.orange,true);line(x+2.25,4.82,x+2.61,4.82,C.orange);line(x+2.61,4.82,x+2.61,4.26,C.orange);line(x+2.61,4.26,x+1.05,4.26,C.orange,true);
}
txt('Đỏ: top 3 chờ • ≥50% ca quá 1 ngày • Phủ ≥10% ca',.6,5.17,6,.38,15,C.gray);txt('AS-IS: 369/400 ca • P90 chờ ký: 1.201 phút',6.86,5.17,5.8,.38,15,C.gray);
rect(.5,5.75,6.03,.91,C.sand);txt('621 → 123 phút chờ ký',.7,5.84,5.65,.4,25,C.red,true);txt('AS-IS: 63% ca chờ hơn một ngày làm việc',.7,6.29,5.65,.26,14);
rect(6.76,5.75,6.03,.91,C.mint);txt('62,3% → 75,5% đi thẳng',6.96,5.84,5.65,.4,25,C.teal,true);txt('Bổ sung: 30,1% → 15,6% là giả định đầu vào',6.96,6.29,5.65,.26,14);
note('Người trình bày: TV3. Sơ đồ rút gọn từ bản đồ luồng trực tiếp thể hiện các chuyển tiếp được quan sát trong log mô phỏng. DFG gốc thể hiện tần suất bằng độ dày và thời gian bằng số trên cạnh. Slide rút gọn để các nhãn dễ đọc, giữ vòng bổ sung, cạnh chờ ký và thông tin tần suất tổng hợp; không mã hóa độ dày của mọi cạnh. Quy tắc đỏ: thuộc top ba bước chờ, ít nhất 50% ca chờ quá một ngày làm việc và xuất hiện trong ít nhất 10% tổng số ca; quy tắc đã chốt trước. Ở AS-IS, cạnh trình ký là ứng viên duy nhất đạt đủ ba tiêu chí tô đỏ: trung vị 621 phút, P90 1.201 phút, 63% ca vượt một ngày và xuất hiện ở 369/400 ca. Ở TO-BE S1 không còn cạnh đỏ, chờ ký 123 phút. Đây là bản đồ một seed minh họa, khác bảng tổng hợp 20 seed. Luồng đi thẳng tăng 62,3% lên 75,5% sau chuẩn hóa bước tương đương. Phân bố vòng bổ sung nhìn qua nhánh quay lại; tài liệu không cung cấp tần suất từng số vòng nên không tự thêm. Tỷ lệ phải bổ sung 30,1% xuống 15,6% là tham số p giả định, không phải phát hiện hay hiệu quả đã chứng minh của web form. Cạnh nộp tới ghi sổ không được diễn giải là xếp hàng thật vì ảnh hưởng quy ước làm tròn đầu ngày.');
// 8
begin('Kiểm chứng phép đo','Đối chiếu tính tay trước khi diễn giải KPI','Các mốc hồ sơ mẫu đã chốt khớp hàm lịch làm việc trong mã nguồn.',true);
const xs=[.5,2.75,5.47],ws=[2.25,2.72,2.72];['Hồ sơ AS-IS','Mốc tính tay (phút)','Kết quả từ mã nguồn'].forEach((v,i)=>cell(v,xs[i],2.64,ws[i],.62,{fill:C.navy,color:C.white,bold:true,size:15}));
[['C001','843','843'],['C002','1.693','1.693'],['C003','1.233','1.233'],['C004','5.740','5.740']].forEach((a,r)=>a.forEach((v,c)=>cell(v,xs[c],3.26+r*.62,ws[c],.62,{fill:r%2?C.mint:C.white,bold:c===0,size:20})));
card(8.48,2.64,4.32,3.1,'Các mốc kiểm tra khác','Chờ ký: 555 và 585 phút\nTrễ phát hiện: 2.130 phút\nTuổi net C004: 95 phút');
banner('Trừ đúng giờ nghỉ • Tách phản hồi của sinh viên • Kiểm trực tiếp KPI trên C001',6.22);
note('Người trình bày: TV3. Bảng ghi các mốc đối chiếu đã được chốt: C001 843, C002 1.693, C003 1.233 và C004 5.740 phút. Đây là mốc kiểm chứng hàm lịch, không tự gán cả bốn là KPI thời gian hoàn tất. Các phép tính chờ ký 555 và 585, trễ phát hiện 2.130, tuổi net C004 95 cũng khớp tính tay. Cách tính trừ giờ nghỉ trưa, ngoài giờ và cuối tuần theo lịch giả định; tách thời gian sinh viên phản hồi khỏi phần net của trường. Hàm KPI được kiểm trực tiếp trên C001. Dàn ý dự kiến sáu hồ sơ, nhưng tài liệu chốt chỉ có số cụ thể cho bốn hồ sơ AS-IS nên bảng chỉ dùng bốn hồ sơ này, không tạo thêm hai ca TO-BE. Không suy rằng đã có đối chiếu đầy đủ từng thành phần của sáu ca.');
// 9
begin('TO-BE • Mô hình đề xuất','Tự động hóa thao tác, giữ thẩm quyền nghiệp vụ','Biểu mẫu kiểm tra sớm; hệ thống sinh bản thảo, lưu vết và kiểm soát hạn.');
['Sinh viên','Cán bộ','Lãnh đạo','Văn thư','Hệ thống'].forEach((v,i)=>{let y=2.58+i*.66;rect(.5,y,12.3,.66,i%2?C.white:'EAF0EB',C.line);txt(v,.63,y+.1,1.55,.46,15,C.teal,true);line(2.23,y,2.23,y+.66,C.line,false,.6);});
function tbnode(t,x,row,w=2.2,fill=C.white){let y=2.66+row*.66;rect(x,y,w,.5,fill,C.line);txt(t,x+.06,y+.025,w-.12,.45,14,C.navy,true,{align:'center'});}
tbnode('Nộp / bổ sung trực tuyến',2.45,0,3.25);tbnode('Nhận kết quả',10.45,0,2.1,C.mint);tbnode('Thẩm định hồ sơ',4.28,1,2.7);tbnode('Xác nhận kết quả',9.82,1,2.73);tbnode('Duyệt / từ chối, ký',6.65,2,2.85);tbnode('Đóng dấu',9.68,3,2.87);tbnode('Kiểm tra / cấp mã',2.45,4,2.55,C.mint);tbnode('Sinh bản thảo',5.18,4,2.17,C.mint);tbnode('Nhắc / đóng hạn',7.53,4,2.5,C.sand);tbnode('Thông báo lưu vết',10.2,4,2.35,C.mint);
line(3.17,3.18,3.17,5.27,C.teal,true);line(4.5,5.27,4.5,3.85,C.teal,true);line(5.75,3.85,5.75,5.27,C.teal,true);line(7.2,5.27,7.2,4.49,C.teal,true);line(9.53,4.23,9.75,4.23,C.teal);line(9.75,4.23,9.75,4.63,C.teal,true);line(11.2,4.63,11.2,3.85,C.teal,true);line(12.67,3.58,12.67,5.57,C.teal);line(12.67,5.57,12.57,5.57,C.teal,true);line(12.55,5.57,12.93,5.57,C.teal);line(12.93,5.57,12.93,2.91,C.teal);line(12.93,2.91,12.57,2.91,C.teal,true);
rect(.5,6.28,12.3,.49,C.sand);txt('Mô hình đích: tự động hóa thao tác; prototype chưa có timer nhắc hạn và đóng quá hạn.',.68,6.31,11.95,.42,15,C.red,true);
note('Người trình bày: TV2. Sơ đồ trên slide rút gọn từ to-be.png theo năm làn. BPMN TO-BE thêm làn hệ thống: kiểm tra định dạng ngay trên biểu mẫu, cấp mã hồ sơ, sinh bản thảo từ mẫu, nhắc hạn, đóng đúng thời điểm quá hạn và thông báo có lưu vết. Loại các thao tác ghi chép, chuyển dữ liệu trùng. Thẩm quyền duyệt của lãnh đạo và đóng dấu của văn thư được giữ trong mô hình nghiệp vụ. Chỉ thay phần thao tác và cách tổ chức lịch ký, không tự động thay thẩm quyền. Phân biệt mô hình đích với phần đã hiện thực: prototype gộp bước, tiền kiểm n8n đứng trước cán bộ xem xét, chưa triển khai timer A16 nhắc hạn và A13 đóng quá hạn. Sinh bản thảo cũng là hướng thiết kế TO-BE, không khẳng định là bằng chứng đã phát hành giấy trong demo.');
// 10
begin('Kiến trúc prototype thật','App ghi trạng thái; n8n điều phối tự động hóa','Một nơi kiểm soát thay đổi giúp giữ hồ sơ và nhật ký nhất quán.');
flowbox('Web sinh viên / cán bộ',.5,2.7,3.1);flowbox('App • FastAPI',4.7,2.7,3.4);flowbox('PostgreSQL',9.2,2.7,3.6);line(3.62,3.03,4.58,3.03,C.teal,true);line(8.14,3.03,9.08,3.03,C.teal,true);
flowbox('n8n • webhook / IF',4.7,4.15,3.4,C.sand);flowbox('Mailpit • SMTP local',9.2,4.15,3.6,C.sand);line(6.4,3.39,6.4,4.09,C.orange,true);line(8.14,4.48,9.08,4.48,C.orange,true);txt('API / callback',6.64,3.55,2.5,.35,14,C.gray);
txt('Vai trò, trạng thái, version\nvà Idempotency-Key',.58,4.04,3.5,.9,17,C.navy,true);txt('Hồ sơ • event log • outbox',9.25,3.48,3.4,.34,15,C.gray);
rect(.5,5.42,12.3,1.29,C.navy);txt('Nộp → Tiền kiểm → Đang xử lý → Duyệt / Từ chối → Đã cấp',.74,5.62,11.8,.41,19,C.white,true);txt('Cần bổ sung → Sinh viên gửi lại → Tiền kiểm lại; tăng lượt xử lý',.74,6.13,11.8,.35,17,'8DD3C7');
note('Người trình bày: TV4. Đây là kiến trúc đã dựng, thay cho đặc tả cũ trong dàn ý. Bốn dịch vụ Docker Compose: app FastAPI và Jinja có PM4Py cho phân tích, PostgreSQL lưu hồ sơ, event log và outbox, n8n điều phối, Mailpit giữ email thử nghiệm local. App là bên duy nhất ghi trạng thái và nhật ký, kiểm tra vai trò, trạng thái, version và Idempotency-Key. n8n nhận webhook, đọc dữ liệu qua API app, tiền kiểm, gọi API chuyển trạng thái, gửi SMTP và callback. Không nói n8n quyết định mọi trạng thái hay đã có năm workflow. Luồng SUBMITTED tới PRECHECK_OK hoặc NEED_SUPPLEMENT; cán bộ IN_REVIEW tới APPROVED, REJECTED hoặc NEED_SUPPLEMENT; sau duyệt tới ISSUED. Nhánh bổ sung và từ chối bắt buộc lý do. Sinh viên gửi lại thì về SUBMITTED và tăng attempt_no. Prototype gộp vai trò và bước so với BPMN; không đại diện đầy đủ thẩm quyền ngoài thực tế.');
// 11
begin('Bằng chứng prototype','Có hồ sơ, nhật ký và email thử nghiệm thật','Thông báo chỉ hoàn tất khi callback từ n8n về trạng thái SYNCED.');
// Crop preserves the supplied screenshots; no new evidence is synthesized.
image(path.join(out,'student_crop.png'),.5,2.57,3.8,2.5);image(img('staff_detail_top.png'),4.48,2.57,4.4,2.7);image(img('mail_crop.png'),9.06,2.57,3.73,2.7);
pill('Nộp và tra cứu',.5,5.35,3.8);pill('Nhật ký xử lý',4.48,5.35,4.4);pill('Mailpit local',9.06,5.35,3.73);
rect(.5,5.97,8.45,.84,C.white);txt('Webhook → đọc dữ liệu → IF → ghi kết quả → email → callback',.7,6.02,8.05,.3,15,C.navy,true);txt('Gửi lại không tạo trùng • Sai quyền / sai thứ tự bị từ chối',.7,6.4,8.05,.3,15,C.gray);
rect(9.17,5.97,3.62,.84,C.teal);txt('20 kiểm thử đạt',9.36,6.08,3.25,.4,24,C.white,true);
note('Người trình bày: TV4. Các ảnh là bằng chứng ghi sẵn từ prototype, không phải dữ liệu đo vận hành trường. Đi từ nộp form và nhận mã tới cán bộ xử lý và thư trong Mailpit. Workflow thật đáp ứng trigger webhook, data source qua API đọc PostgreSQL, IF kiểm tra, ít nhất bốn hành động và SMTP notification. Các hành động gồm ghi tiền kiểm đạt, ghi yêu cầu bổ sung, xác nhận đồng bộ thông báo và phản hồi thành công. App chống gửi trùng bằng Idempotency-Key, chặn sai quyền, sai thứ tự; thao tác lỗi không tạo thêm sự kiện. Nếu n8n hoặc callback lỗi, hồ sơ giữ PENDING/FAILED. Chỉ callback thành công mới ghi SYNCED, không hiển thị thành công giả. Tài liệu chốt báo 20 test tự động prototype đạt, smoke E2E và các luồng trình duyệt gồm cấp giấy và bổ sung gửi lại đã đạt. Khi demo sống: nộp, mở workflow, nhận xử lý, duyệt/cấp, kiểm Mailpit, thử bổ sung và thao tác sai. Nếu lỗi, dùng bằng chứng ghi sẵn và nói rõ trạng thái còn chờ/lỗi.');
// 12
begin('Đánh giá cải tiến','Giảm chờ ký cần thay đổi lịch ký','Mục tiêu dự kiến • S1 tốt hơn AS-IS ở 20/20 seed ghép cặp; chưa phải hiệu quả tại trường.',true);
const metrics=[['T_trường • trung vị',1363,788,'1.363','788'],['T_trường net • P90',1780,804,'1.780','804'],['Chờ ký • trung vị',551,121,'551','121']];
metrics.forEach((m,i)=>{let x=.5+i*3.04;rect(x,2.57,2.89,2.88,C.white);txt(m[0],x+.12,2.73,2.65,.43,15,C.navy,true);let max=m[1],base=4.88;[[m[1],C.gray,m[3],'AS-IS'],[m[2],C.teal,m[4],'S1']].forEach((v,j)=>{let bx=x+.43+j*1.1,bh=v[0]/max*1.12;rect(bx,base-bh,.73,bh,v[1]);txt(v[2],bx-.16,base-bh-.42,1.05,.34,16,v[1],true,{align:'center'});txt(v[3],bx-.11,4.99,.95,.29,14,C.gray,false,{align:'center'});});});
rect(9.78,2.57,3.02,2.88,C.navy);txt('AS-IS → S1',9.98,2.77,2.62,.4,17,'8DD3C7',true);txt('1.363 → 788',9.98,3.35,2.62,.45,24,C.white,true);txt('T_trường • phút',9.98,3.87,2.62,.35,16,'D4E6E5');txt('551 → 121',9.98,4.38,2.62,.45,24,C.white,true);txt('Chờ ký • phút',9.98,4.92,2.62,.3,16,'D4E6E5');
txt('Đơn vị: phút làm việc • Trung vị qua 20 seed • Thang đo riêng cho từng KPI',.55,5.44,9,.23,14,C.gray);
rect(.5,5.68,12.3,.57,C.sand);txt('S0 vẫn ký theo lô: chờ ký 551 → 584 phút; không có seed cải thiện (0/20).',.7,5.73,11.9,.43,18,C.red,true);
txt('Thao tác cán bộ: 43 → 21 phút/ca   •   Trễ phát hiện quá hạn: 1.239 → 0 phút',.68,6.45,12,.36,18,C.teal,true);
note('Người trình bày: TV4. Biểu đồ trên slide dựng lại các trung vị tổng hợp qua 20 seed, chỉ dùng số đã chốt. Ảnh kpi_compare.png đầu vào có thêm khoảng min–max; tài liệu văn bản không cung cấp giá trị biên nên slide không tự dựng các khoảng này. K1 T_trường AS-IS 1.363 và S1 788 phút; giảm ghép cặp trung vị 574 phút theo kết quả đã chốt, không lấy hiệu hai số đã làm tròn để thay con số ghép cặp. K2 P90 T_trường_net 1.780 xuống 804. K3 chờ ký 551 xuống 121, mức giảm ghép cặp 434 phút. K1, K2 và K3 đều cải thiện ở 20/20 seed S1. S0 chỉ tự động hóa mà còn ký theo lô: chờ ký 584, chênh ghép cặp +26 phút, 0/20 seed tốt hơn. Vì vậy cải thiện chờ ký đến từ đổi lịch ký hai lần mỗi ngày, không chỉ phần mềm. Phần mềm giảm thao tác cán bộ 43 xuống 21 phút/ca và trễ phát hiện 1.239 xuống 0 trong mô hình. K5 net bằng 0% mọi cấu hình, không phân biệt được; thay bằng K5b gross 9,8% so với 0% ở S1. Tỷ lệ đóng quá hạn 12,7–14,2% do giữ hành vi sinh viên; không kết luận nhắc hạn giảm tỷ lệ này. Tỷ lệ bổ sung là tham số, không phải hiệu quả đo được. Bộ 20 test prototype ở slide trước kiểm kỹ thuật, khác bằng chứng cải thiện trong mô phỏng.');
// 13
begin('Giới hạn và bước tiếp theo','Từ minh họa phương pháp đến kiểm định tại trường','Cần nhật ký thực tế trước khi kết luận hiệu quả vận hành.');
card(.5,2.62,4,2.18,'Giả định chưa kiểm định','Tham số là giả định\nMột cán bộ kiêm nhiệm\nChưa tích hợp dữ liệu trường',C.orange);
card(4.7,2.62,3.93,2.18,'Thu thập nhật ký','Sổ tiếp nhận\nPhiếu trình ký, sổ văn thư\nHộp thư và bằng chứng gửi');
card(8.83,2.62,3.97,2.18,'Thí điểm và hiệu chỉnh','Hiệu chỉnh tham số mô phỏng\nĐo lại hằng tuần\nHoàn thiện timer và các bước còn thiếu');
line(2.5,5.2,10.7,5.2,C.teal,true);['Prototype học thuật','Nhật ký thực tế','Đo kiểm thí điểm'].forEach((v,i)=>{flowbox(v,.5+i*4.2,5.6,3.97);});
banner('Đo đúng thời gian chờ → chọn đúng thay đổi → kiểm chứng bằng dữ liệu thực',6.46);
note('Người trình bày: TV1. Kết luận ở mức phương pháp: tách được chờ và xử lý, xác định ứng viên chờ ký trong mô phỏng, hiện thực một phần tự động hóa có nhật ký và bằng chứng thư. Giới hạn: thời gian, tỷ lệ bổ sung giả định; một cán bộ kiêm nhiệm; chưa kết nối cơ sở dữ liệu thật; mô hình chưa loại trừ các ngày lễ nêu trong tài liệu nên không ngoại suy mùa cao điểm hay nhiều cán bộ. Analytics trong app dùng bộ nhỏ 120 ca mỗi kịch bản để minh họa, không thay bộ chính 20 seed của bài. Bước tiếp theo là xin thí điểm, thu sổ tiếp nhận, phiếu trình, sổ văn thư và hộp thư, thống nhất định nghĩa sự kiện, hiệu chỉnh tham số và đo hằng tuần. Hoàn thiện timer và các bước prototype còn thiếu trước khi thử nghiệm vận hành. Nhấn mạnh chưa có chứng minh hiệu quả thực tế tại trường và không phát hành giấy có giá trị pháp lý.');
await pres.writeFile({fileName:path.join(out,'slide.pptx')});
for(let i=0;i<previews.length;i++){let p=previews[i];let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#${p.bg}"/>${p.parts.join('')}</svg>`;await sharp(Buffer.from(svg)).png().toFile(path.join(out,`preview-${String(i+1).padStart(2,'0')}.png`));}
fs.writeFileSync(path.join(out,'layout-audit.json'),JSON.stringify(textAudit,null,2));
console.log(`Created ${pres._slides.length} slides: output/slide.pptx`);
}
(async()=>{await sharp(img('student_full.png')).extract({left:0,top:0,width:2160,height:1320}).png().toFile(path.join(out,'student_crop.png'));await build();})().catch(e=>{console.error(e);process.exit(1)});
