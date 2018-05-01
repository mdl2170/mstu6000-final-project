angular.module("mwc.blocklylab", ["mwc.blockly"])

    .controller("BlocklyLabController", [
        "$scope",
        function($scope) {
            $scope.$watch("blocklyApi", function(newValue, oldValue) {
                if (!(newValue && !oldValue)) {
                    return;
                }

                window.Blockly = $scope.blocklyApi;

                $scope.blocklyApi.Blocks["function_block"] = {
                    init: function() {
                        this.setColour(20);
                        this.appendValueInput("input")
                            .appendField("FunÃ§Ã£o");
                        this.setTooltip("");
                    }
                };

                $scope.blocklyApi.JavaScript["function_block"] = function(block) {
                    var value_input = $scope.blocklyApi.JavaScript.valueToCode(block, "input", $scope.blocklyApi.JavaScript.ORDER_ATOMIC);

                    return "function(" + value_input + ")";
                };

                $scope.blocklyApi.Blocks["string_block"] = {
                    init: function() {
                        this.setColour(330);
                        this.appendDummyInput()
                            .appendField(new $scope.blocklyApi.FieldTextInput("Escreva algo aqui"), "CONTENT");
                        this.setOutput(true, "String");
                        this.setTooltip("");
                    }
                };

                $scope.blocklyApi.JavaScript["string_block"] = function(block) {
                    var text_content = block.getFieldValue("CONTENT");
                    var code = new Array(2);
                    code[0] = "'" + text_content + "'";
                    code[1] = $scope.blocklyApi.JavaScript.ORDER_NONE;
                    return code;
                };

                $scope.initBlockly([
                    "function_block",
                    "string_block",
                    "math_number",
                ]);
            });
        }
    ]);
