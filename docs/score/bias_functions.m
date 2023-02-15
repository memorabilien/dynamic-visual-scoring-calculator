syms x;
format long;
p = 1;
t = 200;
b = 0;
g = 500;


b = (b-5.01)/(b+5.01);
j(x) = p * (x - t);
f(x) = 1/pi * atan(x) + 0.5;

%cubic
g3 = 1/(2^(1/3)*g);
h3(x) = 2* f(2 * x^3) -1;
S3(x) = 1000 * f(1000 * j(x)) *  h3(g3*b*j(x)) +1000; 
%qudratic
g2 = 1/(2^(1/2)*g);
h2(x) = 2* f(-2*x^2)-1;
%linear
g1 = 1/(2*g);
S1(x)= (1000* (f(-1000* j(x))-0.5) +1000* (f(1000* j(x))-0.5)*(b* g1* j(x)+1) ) +( 1000* (f(1000* j(x+(1/(p* b* g1))  ))-0.5)* (-b* g1* j(x)-1))+500;
S2(x) = 1000 * f(1000* j(x)) * h2(g2*b*j(x))  + 1000;
%default
g0 = 1/(2^(1/1)*g);
h0(x) = 2 *f(2*x)-1;
S0(x) = 1000* f(1000* j(x)) * h0(g0*b*j(x)) + 1000;







x1 = 0;
x2 = 2000;
i = [x1 x2];
%darkest
%#1e1e1e
%#232529
%#282c34
%lightest
p = figure("name","Scoring Function - Cubic");

p.ToolBar = "none";
p.DockControls = "off";
p.Color = "#232529";
p.WindowState = "maximized";






hold on;
%lin
fr = fplot(S1, i);fr.MeshDensity = 200;fr.LineWidth = 3;fr.Color = "#00ff75";
hold on;
%quad
fq = fplot(S2,i);fq.MeshDensity = 200;fq.LineWidth = 3;fq.Color = "#ff5e5e";
hold on;
%cubic
fp = fplot(S3, i); fp.MeshDensity= 400;fp.LineWidth = 3;fp.Color = "#6f70fb";
hold on;
%default
fs = fplot(S0,i);fs.MeshDensity = 200;fs.LineWidth = 3;fs.Color = "#fff500";
hold on;
yline(500, "Color","#fcc217","Label","Score");
hold on
xline(700, "Color","#fcc217","Label","Value");
hold on
xline(200,"Color","#28cc19","Label","Target Value");
hold off
grid on

legend("Linear","Quadratic","Cubic","Default")
title("Scoring Functions","Color","white");
subtitle("bias = 0, grain = 500, target = 200, direction = 1", "Color", "white")
ax = gca;
ax.YLabel.String = "Category Score";
ax.XLabel.String = "Category Value";
ax.YLabel.Color ="white";
ax.XLabel.Color = "white";
ax.FontName = 'Segoe UI';
plot_darkmode





