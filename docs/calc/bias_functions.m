syms x;
format long;
p = 1;
t = 200;
b = 0;
g = 500;

b1 = (b-5.01)/(b+5.01);
g1 = 1/(1.259920629921*g);

j(x) = p * (x - t);
f(x) = 1/pi * atan(x) + 0.5;
h(x) = 2* f(2 * x^3) -1;

S(x) = 1000 * f(1000 * j(x)) *  h(g1*b1*j(x)) +1000; 

x1 = 0;
x2 = 2000;
i = [x1 x2];
%darkest
%#1e1e1e
%#232529
%#282c34
%lightest
%p = figure("name","Scoring Function - Cubic","Color","#232529");
p = figure("name","Scoring Function - Cubic");
%p.MenuBar ="none";
p.ToolBar = "none";
p.DockControls = "off";
p.Color = "#232529";
p.WindowState = "maximized";


fp = fplot(S, i);
fp.MeshDensity = 200;
fp.LineWidth = 3;
fp.Color = "#0075ff";

hold on
yline(500, "Color","#fcc217","Label","Score");
hold on
xline(700, "Color","#fcc217","Label","Value");
hold on
xline(200,"Color","#28cc19","Label","Target Value");
hold off
grid on

title("Scoring Function - Cubic","Color","white");
subtitle("bias = 0, grain = 500, target = 200, direction = 1", "Color", "white")
ax = gca;
ax.YLabel.String = "Category Score";
ax.XLabel.String = "Category Value";
ax.YLabel.Color ="white";
ax.XLabel.Color = "white";
ax.FontName = 'Segoe UI';

plot_darkmode

