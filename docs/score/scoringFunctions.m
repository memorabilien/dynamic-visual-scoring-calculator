addpath(".\")
import plot_darkmode.*
syms x;
format long;
p = 1;
t = 200;
b = 0;
g = 500;


b = (b-5.01)/(b+5.01);
j(x) = p * (x - t);
f(x) = 1/pi * atan(x) + 0.5;
%erf
g4 = abs(t) + g;
h4(x) = f(exp(99)*x);
v = abs( log(t)-log(g4) )/(3*sqrt(2)*0.9061938024368232);
m4(x) = 1/(1+(0.3275911*abs(x)));
e(x) = sign(x)*(1-(((((1.061405429* m4(x)+-1.453152027)* m4(x))+1.421413741)* m4(x)+-0.284496736)* m4(x)+0.254829592)* m4(x)*exp(-(x*x)));
k(x) = 0.5*(1-e( -b^(-1) * (log(abs(x))-log(g4))/(sqrt(2)*v) ));
q(x) = 1000*k(x)*h4(x)+ 1000*h4(-x);
S4(x) = q(p*x);
%cubic
g3 = 1/(2^(1/3)*g);
h3(x) = 2* f(2 * x^3) -1;
S3(x) = 1000 * f(1000 * j(x)) *  h3(g3*b*j(x)) +1000; 
%qudratic
g2 = 1/(2^(1/2)*g);
h2(x) = 2* f(-2*x^2)-1;
S2(x) = 1000 * f(1000* j(x)) * h2(g2*b*j(x))  + 1000;
%linear
g1 = 1/(2*g);
S1(x)= (1000* (f(-1000* j(x))-0.5) +1000* (f(1000* j(x))-0.5)*(b* g1* j(x)+1) ) +( 1000* (f(1000* j(x+(1/(p* b* g1))  ))-0.5)* (-b* g1* j(x)-1))+500;
%default
g0 = 1/(2^(1/1)*g);
h0(x) = 2 *f(2*x)-1;
S0(x) = 1000* f(1000* j(x)) * h0(g0*b*j(x)) + 1000;







x1 = 1;
x2 = 2000;
i = [x1 x2];
%darkest
%#1e1e1e
%#232529
%#282c34
%lightest
pf = figure("name","Scoring Function - Cubic");

pf.ToolBar = "none";
pf.DockControls = "off";
pf.Color = "#232529";
pf.WindowState = "maximized";






hold on;
%lin
fr = fplot(S1, i);fr.MeshDensity = 200;fr.LineWidth = 2;fr.Color = "#00ff75";
hold on;
%quad
fq = fplot(S2,i);fq.MeshDensity = 200;fq.LineWidth = 2;fq.Color = "#ff5e5e";
hold on;
%cubic
fp = fplot(S3, i); fp.MeshDensity= 400;fp.LineWidth = 2;fp.Color = "#6f70fb";
hold on;
%default
fs = fplot(S0,i);fs.MeshDensity = 200;fs.LineWidth = 2;fs.Color = "#fff500";
hold on;
%erf
ft = fplot(S4,i);ft.MeshDensity = 400; ft.LineWidth = 2;ft.Color = "#11F1F1";
hold on;
yline(500, "Color","#fcc217","Label","Score");
hold on
xline(700, "Color","#fcc217","Label","Value");
hold on
xline(200,"Color","#28cc19","Label","Target Value");
hold off
grid on

legend("Linear","Quadratic","Cubic","Default","Error Function")
title("Scoring Functions","Color","white");
txt = ['bias = '  int2str(b)  ', grain = ' int2str(g) ', target = ' int2str(t) ', direction = ' int2str(p)];
subtitle(txt, "Color", "white");
ax = gca;
ax.YLabel.String = "Category Score";
ax.XLabel.String = "Category Value";
ax.YLabel.Color ="white";
ax.XLabel.Color = "white";
ax.FontName = 'Segoe UI';
plot_darkmode





