(function() {
    var dataviz = kendo.dataviz,
        deepExtend = kendo.deepExtend,
        getElement = dataviz.getElement,
        Point2D = dataviz.Point2D,
        Box2D = dataviz.Box2D,
        chartBox = new Box2D(100, 100, 500, 500),
        center = new Point2D(300, 300),
        view,
        axis,
        altAxis,
        TOLERANCE = 4;

    function createAxis(options) {
        altAxis = {
            options: { visible: true },
            lineBox: function() { return new Box2D(300, 100, 300, 300); }
        };

        axis = new dataviz.RadarCategoryAxis(
            deepExtend({
                categories: ["Foo", "Bar", "Baz"]
            }, options)
        );
        axis.reflow(chartBox);
        axis.plotArea = {
            options: {},
            valueAxis: altAxis
        };

        view = new ViewStub();
        axis.getViewElements(view);
    }

    function lineEnd(line) {
        return new Point2D(line.x2, line.y2);
    }

    // ------------------------------------------------------------
    module("Radar Category Axis / Rendering", {
        setup: function() {
            createAxis();
        }
    });

    test("line box equals box", function() {
        deepEqual(axis.lineBox(), axis.box);
    });

    test("creates labels", 1, function() {
        deepEqual($.map(view.log.text, function(text) { return text.content }),
             ["Foo", "Bar", "Baz"]);
    });

    test("creates labels with full format", 1, function() {
        createAxis({ categories: [1, 2], labels: { format: "{0:C}"} });

        deepEqual($.map(view.log.text, function(text) { return text.content }),
             ["$1.00", "$2.00"]);
    });

    test("creates labels with simple format", 1, function() {
        createAxis({ categories: [1, 2], labels: { format: "C"} });

        deepEqual($.map(view.log.text, function(text) { return text.content }),
             ["$1.00", "$2.00"]);
    });

    test("labels can be hidden", function() {
        createAxis({
            labels: {
                visible: false
            }
        });

        equal(axis.labels.length, 0);
    });

    test("labels have set template", 1, function() {
        createAxis({
            labels: {
                template: "|${ data.value }|"
            }
        });

        equal(view.log.text[0].content, "|Foo|");
    });

    test("labels have set color", 1, function() {
        createAxis({
            labels: {
                color: "#f00"
            }
        });

        equal(view.log.text[0].style.color, "#f00");
    });

    test("labels have set background", 1, function() {
        createAxis({
            labels: {
                background: "#f0f"
            }
        });

        equal(view.log.rect[0].style.fill, "#f0f");
    });

    test("labels have set zIndex", 1, function() {
        createAxis({
            zIndex: 2
        });

        equal(view.log.text[0].style.zIndex, 2);
    });

    test("labels are distributed around axis (justified)", function() {
        arrayClose(
            $.map(view.log.text, function(text) {
                return [text.style.x, text.style.y]
            }),
            [289.5, 75, 482.535, 410, 97.465, 410],
            TOLERANCE
        );
    });

    test("labels are distributed around axis (non-justified)", function() {
        createAxis({ justified: false });

        arrayClose(
            $.map(view.log.text, function(text) {
                return [text.style.x, text.style.y]
            }),
            [483, 175, 290.5, 510, 97, 175],
            TOLERANCE
        );
    });

    test("labels margin is applied", function() {
        createAxis({ labels: { margin: 5 } });

        arrayClose(
            $.map(view.log.text, function(text) {
                return [text.style.x, text.style.y]
            }),
            [289.5, 80, 478, 405, 102, 405],
            TOLERANCE
        );
    });

    test("labels are distributed in reverse (justified)", function() {
        createAxis({ reverse: true });

        arrayClose(
            $.map(view.log.text, function(text) {
                return [text.style.x, text.style.y]
            }),
            [289.5, 75, 97.465, 410, 482.535, 410],
            TOLERANCE
        );
    });

    test("labels are distributed in reverse (non-justified)", function() {
        createAxis({ justified: false, reverse: true });

        arrayClose(
            $.map(view.log.text, function(text) {
                return [text.style.x, text.style.y]
            }),
            [96, 175, 290.5, 510, 483, 175],
            TOLERANCE
        );
    });

    // ------------------------------------------------------------
    module("Radar Category Axis / Intervals", {
        setup: function() {
            createAxis();
        }
    });

    test("major intervals in normal order", function() {
        deepEqual(axis.majorIntervals(), [ 0, 120, 240 ]);
    });

    test("major intervals in reverse order", function() {
        createAxis({ reverse: true });
        deepEqual(axis.majorIntervals(), [ 0, 240, 120 ]);
    });

    test("minor intervals in normal order", function() {
        deepEqual(axis.minorIntervals(), [ 0, 60, 120, 180, 240, 300 ]);
    });

    test("minor intervals in reverse order", function() {
        createAxis({ reverse: true });
        deepEqual(axis.minorIntervals(), [ 0, 300, 240, 180, 120, 60 ]);
    });

    // ------------------------------------------------------------
    var slot;

    module("Radar Category Axis / Slots", {
        setup: function() {
            createAxis();
            slot = axis.getSlot(0);
        }
    });

    test("slot center matches box center", function() {
        equal(slot.c.x, 300);
        equal(slot.c.y, 300);
    });

    test("slot inner radius is 0", function() {
        equal(slot.ir, 0);
    });

    test("slot radius is half box height", function() {
        equal(slot.r, 200);
    });

    test("slot angle for first category (justified)", function() {
        equal(slot.startAngle, 30);
        equal(slot.angle, 120);
    });

    test("slot angle for first category (non-justified)", function() {
        createAxis({ justified: false });

        slot = axis.getSlot(0);
        equal(slot.startAngle, 90);
        equal(slot.angle, 120);
    });

    test("slot for first category in reverse (justified)", function() {
        createAxis({ reverse: true });

        slot = axis.getSlot(0);
        equal(slot.startAngle, 30);
        equal(slot.angle, 120);
    });

    test("slot for first category in reverse (non-justified)", function() {
        createAxis({ reverse: true, justified: false });

        slot = axis.getSlot(0);
        equal(slot.startAngle, 330);
        equal(slot.angle, 120);
    });

    test("slot angle for second category (justified)", function() {
        slot = axis.getSlot(1);
        equal(slot.startAngle, 150);
        equal(slot.angle, 120);
    });

    test("slot angle for second category (non-justified)", function() {
        createAxis({ justified: false });

        slot = axis.getSlot(1);
        equal(slot.startAngle, 210);
        equal(slot.angle, 120);
    });

    test("slot for second category in reverse (justified)", function() {
        createAxis({ reverse: true });

        slot = axis.getSlot(1);
        equal(slot.startAngle, 270);
        equal(slot.angle, 120);
    });

    test("slot for second category in reverse (non-justified)", function() {
        createAxis({ reverse: true, justified: false });

        slot = axis.getSlot(1);
        equal(slot.startAngle, 210);
        equal(slot.angle, 120);
    });

    test("slot angle for last category (justified)", function() {
        slot = axis.getSlot(2);
        equal(slot.startAngle, 270);
        equal(slot.angle, 120);
    });

    test("slot angle for last category (non-justified)", function() {
        createAxis({ justified: false });

        slot = axis.getSlot(2);
        equal(slot.startAngle, 330);
        equal(slot.angle, 120);
    });

    test("slot for last category in reverse (justified)", function() {
        createAxis({ reverse: true });

        slot = axis.getSlot(2);
        equal(slot.startAngle, 150);
        equal(slot.angle, 120);
    });

    test("slot for last category in reverse (non-justified)", function() {
        createAxis({ reverse: true, justified: false });

        slot = axis.getSlot(2);
        equal(slot.startAngle, 90);
        equal(slot.angle, 120);
    });

    test("slot for two categories (justified)", function() {
        slot = axis.getSlot(0, 1);
        equal(slot.startAngle, 30);
        equal(slot.angle, 240);
    });

    test("slot for two categories (non-justified)", function() {
        createAxis({ justified: false });

        slot = axis.getSlot(0, 1);
        equal(slot.startAngle, 90);
        equal(slot.angle, 240);
    });

    test("assumes 1 category when no categories are defined (justified)", function() {
        createAxis({ categories: [] });

        slot = axis.getSlot(0);
        equal(slot.startAngle, 270);
        equal(slot.angle, 360);
    })

    test("assumes 1 category when no categories are defined (non-justified)", function() {
        createAxis({ categories: [], justified: false });

        slot = axis.getSlot(0);
        equal(slot.startAngle, 90);
        equal(slot.angle, 360);
    });

    test("reports range minimum of 0", function() {
        equal(axis.range().min, 0);
    });

    test("reports range maximum equal to category count", function() {
        equal(axis.range().max, 3);
    });

    test("from value can't be lower than 0", function() {
        slot = axis.getSlot(-1);
        equal(slot.startAngle, 30);
    });

    test("caps from value to categories count", function() {
        slot = axis.getSlot(1000);
        equal(slot.startAngle, 270);
    });

    test("to value equals from value when not set", function() {
        slot = axis.getSlot(1000);
        equal(slot.angle, 120);
    });

    test("to value equals from value when smaller", function() {
        slot = axis.getSlot(2, 1);
        equal(slot.startAngle, 270);
    });

    // ------------------------------------------------------------
    module("Radar CategoryAxis / getCategory ", {
        setup: function() {
            createAxis();
        }
    });

    test("returns null for coordinates outside of circle", function() {
        deepEqual(axis.getCategory(new Point2D(0, 0)), null);
    });

    test("returns first category for innermost point", function() {
        equal(axis.getCategory(new Point2D(300, 299)), "Foo");
    });

    test("returns second category for innermost point", function() {
        equal(axis.getCategory(new Point2D(301, 300)), "Bar");
    });

    test("returns third category for innermost point", function() {
        equal(axis.getCategory(new Point2D(299, 300)), "Baz");
    });

    // ------------------------------------------------------------
    module("Radar CategoryAxis / getCategory / Reverse", {
        setup: function() {
            createAxis({ reverse: true });
        }
    });

    test("returns first category for innermost point", function() {
        equal(axis.getCategory(new Point2D(300, 299)), "Foo");
    });

    test("returns second category for innermost point", function() {
        equal(axis.getCategory(new Point2D(299, 300)), "Bar");
    });

    test("returns third category for innermost point", function() {
        equal(axis.getCategory(new Point2D(301, 300)), "Baz");
    });

    // ------------------------------------------------------------
    module("Radar Category Axis / Grid lines", {
        setup: function() {
            createAxis();
            axis.renderGridLines(view, altAxis);
        }
    });

    test("renders major grid lines by default", function() {
        equal(view.log.line.length, 2);
    });

    test("major grid lines extend from axis center", function() {
        equal(view.log.line[0].x1, 300);
        equal(view.log.line[0].y1, 300);
    });

    test("major grid lines extend to value axis end", function() {
        close(view.log.line[0].x2, 473, TOLERANCE);
        close(view.log.line[0].y2, 400, TOLERANCE);
    });

    test("renders 90 degree grid line when value axis is not visible", function() {
        createAxis();
        axis.renderGridLines(view, {
            options: { visible: false },
            lineBox: altAxis.lineBox
        });

        equal(view.log.line[0].x2, 300);
        equal(view.log.line[0].y2, 100);
    });

    test("applies major grid line color", function() {
        createAxis({ majorGridLines: { color: "red" } });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line[0].options.stroke, "red");
    });

    test("applies major grid line width", function() {
        createAxis({ majorGridLines: { width: 2 } });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line[0].options.strokeWidth, 2);

    });

    test("renders minor grid lines", function() {
        createAxis({
            majorGridLines: {
                visible: false
            },
            minorGridLines: {
                visible: true
            }
        });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line.length, 5);
    });

    test("applies minor grid line color", function() {
        createAxis({
            majorGridLines: {
                visible: false
            },
            minorGridLines: {
                visible: true,
                color: "red"
            }
        });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line[0].options.stroke, "red");
    });

    test("applies minor grid line width", function() {
        createAxis({
            majorGridLines: {
                visible: false
            },
            minorGridLines: {
                visible: true,
                width: 4
            }
        });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line[0].options.strokeWidth, 4);
    });

    // ------------------------------------------------------------
    module("Radar Category Axis / Grid lines / startAngle", {
        setup: function() {
            createAxis({ categories: ["A", "B", "C", "D"], startAngle: 80 });
            axis.renderGridLines(view, altAxis);
        }
    });

    test("major grid lines are offset with start angle", function() {
        var ref = Point2D.onCircle(center, 80, 200),
            end = lineEnd(view.log.line[0]);

        ok(ref.equals(end));
    });

    test("renders 90 degree grid line as it no longer overlaps the value axis", function() {
        createAxis({ categories: ["A", "B", "C", "D"], startAngle: 10 });
        axis.renderGridLines(view, altAxis);

        equal(view.log.line.length, 4);
    });

    // ------------------------------------------------------------
    module("Radar Category Axis / Plot Bands", {
        setup: function() {
            createAxis({
                plotBands: [{
                    from: 0,
                    to: 1,
                    opacity: 0.5,
                    color: "red"
                }, {
                    from: 1.25,
                    to: 1.75
                }, {
                    from: 1.25,
                    to: 2
                }, {
                    from: 1,
                    to: 1.75
                }, {
                    from: 1,
                    to: 2.5
                }]
            });
        }
    });

    test("renders sectors", function() {
        equal(view.log.sector.length, 5);
    });

    test("sets sector start angle for full slot", function() {
        equal(view.log.sector[0].sector.startAngle, 30);
    });

    test("sets sector angle for full slot", function() {
        equal(view.log.sector[0].sector.angle, 120);
    });

    test("sets sector start angle for partial slot (from & to)", function() {
        equal(view.log.sector[1].sector.startAngle, 180);
    });

    test("sets sector angle for partial slot (from & to)", function() {
        equal(view.log.sector[1].sector.angle, 60);
    });

    test("sets sector start angle for partial slot (from)", function() {
        equal(view.log.sector[2].sector.startAngle, 180);
    });

    test("sets sector angle for partial slot (from)", function() {
        equal(view.log.sector[2].sector.angle, 90);
    });

    test("sets sector start angle for partial slot (to)", function() {
        equal(view.log.sector[3].sector.startAngle, 150);
    });

    test("sets sector angle for partial slot (to)", function() {
        equal(view.log.sector[3].sector.angle, 90);
    });

    test("sets sector start angle for long partial slot (to)", function() {
        equal(view.log.sector[4].sector.startAngle, 150);
    });

    test("sets sector angle for long partial slot (to)", function() {
        equal(view.log.sector[4].sector.angle, 180);
    });

    test("renders color", function() {
        equal(view.log.sector[0].style.fill, "red");
    });

    test("renders opacity", function() {
        equal(view.log.sector[0].style.fillOpacity, 0.5);
    });

    test("renders z index", function() {
        equal(view.log.sector[0].style.zIndex, -1);
    });

    (function() {
        var chart,
            label,
            plotArea;

        function axisLabelClick(clickHandler, options) {
            chart = createChart($.extend(true, {
                dataSource: [{
                    value: 1,
                    category: "A"
                }, {
                    value: 2,
                    category: "B"
                }, {
                    value: 3,
                    category: "C"
                }],
                series: [{
                    type: "radarColumn",
                    field: "value"
                }],
                categoryAxis: {
                    name: "Axis A",
                    field: "category"
                },
                axisLabelClick: clickHandler
            }, options));

            plotArea = chart._model.children[1];
            label = plotArea.categoryAxis.labels[1];
            clickChart(chart, getElement(label.options.id));
        }

        // ------------------------------------------------------------
        module("Radar Category Axis / Events / axisLabelClick", {
            teardown: destroyChart
        });

        test("fires when clicking axis labels", 1, function() {
            axisLabelClick(function() { ok(true); });
        });

        test("event arguments contain axis options", 1, function() {
            axisLabelClick(function(e) {
                equal(e.axis.type, "category");
            });
        });

        test("event arguments contain DOM element", 1, function() {
            axisLabelClick(function(e) {
                equal(e.element.length, 1);
            });
        });

        test("event arguments contain category index", 1, function() {
            axisLabelClick(function(e) {
                equal(e.index, 1);
            });
        });

        test("category index is correct when step is defined", 1, function() {
            axisLabelClick(function(e) {
                equal(e.index, 2);
            }, {
                categoryAxis: {
                    labels: {
                        step: 2
                    }
                }
            });
        });

        test("event arguments contain category name as text", 1, function() {
            axisLabelClick(function(e) {
                equal(e.text, "B");
            });
        });

        test("event arguments contain category name as value", 1, function() {
            axisLabelClick(function(e) {
                equal(e.value, "B");
            });
        });

        test("event arguments contain category data item", 1, function() {
            axisLabelClick(function(e) {
                equal(e.dataItem.value, 2);
            });
        });

    })();

    (function() {
        var chart,
            label,
            plotArea;

        function createBoundChart(options) {
            chart = createChart($.extend(true, {
                dataSource: [{
                    value: 1,
                    category: "A"
                }, {
                    value: 2,
                    category: "B"
                }, {
                    value: 3,
                    category: "C"
                }],
                series: [{
                    type: "radarColumn",
                    field: "value"
                }],
                categoryAxis: {
                    name: "Axis A",
                    field: "category"
                }
            }, options));

            plotArea = chart._model.children[1];
            label = plotArea.categoryAxis.labels[1];
            $(getElement(label.options.id)).click();
        }

        // ------------------------------------------------------------
        module("Radar Category Axis / Data Binding", {
            teardown: destroyChart
        });

        test("categories are data bound", function() {
            createBoundChart();
            equal(plotArea.categoryAxis.labels.length, 3);
        });

        test("template has access to data item", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        template: "#= ok(typeof dataItem.value == 'number') #"
                    }
                }
            });
        });

    })();
})();
