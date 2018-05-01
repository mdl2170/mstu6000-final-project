var workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  maxBlocks: 20
});

var myInterpreter;

workspace.addChangeListener(function() {
  $("#block-left").text(workspace.remainingCapacity());
});

function runJS() {
  reset();
  Snap("#btn-reset").attr({ disabled: ''});

  Blockly.JavaScript.addReservedWords('code');
  Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  Blockly.JavaScript.addReservedWords('highlightBlock');

  Snap.load("assets/girl-02.svg", function(f) {
    girl.select("svg").remove();
    girl.append(f);
  });

  var code = Blockly.JavaScript.workspaceToCode(workspace);
  myInterpreter = new Interpreter(code, initApi);
  nextStep();
  // myInterpreter.run();

  // try {
  //   eval(code);
  // } catch (e) {
  //   alert(e);
  // }
}

// Define Blockly blocks
Blockly.Blocks['move'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("move")
      .appendField(new Blockly.FieldDropdown([
        ["left", "left"],
        ["right", "right"],
        ["up", "up"],
        ["down", "down"]
      ]), "direction");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['robot'] = {
  init: function() {
    this.appendStatementInput("NAME")
      .setCheck(null)
      .appendField("Robot");
    this.setColour(300);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['rub'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("rub");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['extend'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("extend");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
var basicTimeline = anime.timeline();

Blockly.JavaScript['move'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  // TODO: Assemble JavaScript into code variable.
  var code = 'move("' + dropdown_direction + '");';
  return code;
};

Blockly.JavaScript['robot'] = function(block) {
  var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
  // TODO: Assemble JavaScript into code variable.
  return statements_name;
};

Blockly.JavaScript['rub'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = "rub();";
  return code;
};

Blockly.JavaScript['extend'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = "extend();";
  return code;
};

function highlightBlock(id) {
  workspace.highlightBlock(id);
}

function initApi(interpreter, scope) {
  // Add an API function for highlighting blocks.
  var wrapper = function(id) {
    return workspace.highlightBlock(id);
  };
  interpreter.setProperty(scope, 'highlightBlock',
    interpreter.createNativeFunction(wrapper));

  wrapper = function(direction) {
    return move(direction);
  };
  interpreter.setProperty(scope, 'move',
    interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return rub();
  };
  interpreter.setProperty(scope, 'rub',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return extend();
  };
  interpreter.setProperty(scope, 'extend',
      interpreter.createNativeFunction(wrapper));
}

function nextStep() {
  if (myInterpreter.step()) {
    window.setTimeout(nextStep, 100);
  }
}

// Load SVG assets
var girl = Snap("#girl");
var bottomLeftArm = Snap("#bottom-left-arm");
var topLeftArm = Snap("#top-left-arm");
var bottomRightArm = Snap("#bottom-right-arm");
var topRightArm = Snap("#top-right-arm");
var topArm = Snap("#top-arm");
var bubble = Snap("#bubble");
var isExtended;

start();

function start() {
  Snap.load("assets/bubble.svg", function(f) {
    bubble.append(f);
    bubble.attr({
        opacity: 0
    });
  });

  Snap.load("assets/girl-01.svg", function(f) {
    girl.append(f);
  });

  Snap.load("assets/arm-04-04.svg", function(f) {
    bottomLeftArm.append(f);

    // anime({
    //   targets: '#bottom-left-arm',
    //   translateY: 25,
    //   loop: 2,
    //   duration: 1000,
    //   direction: 'alternate',
    //   easing: 'easeInOutCirc',
    // });
    // anime({
    //   targets: '#left-arm',
    //   translateX: 10,
    //   loop: 2,
    //   duration: 1000,
    //   direction: 'alternate',
    //   easing: 'easeInOutCirc',
    //   delay: 1500
    // });
  });
  isExtended = 0;
}

function reset() {
  girl.select("svg").remove();
  bottomLeftArm.select("svg").remove();
  bubble.select("svg").remove();
  bottomLeftArm.attr({ style: 'bottom: 280px' });
  start();
  Snap("#btn-reset").attr({ disabled: 'disabled' });
}

Snap.load("assets/arm-05.svg", function(f) {
  topLeftArm.append(f);

  anime({
    targets: '#top-left-arm',
    translateX: 10,
    loop: 2,
    duration: 1000,
    direction: 'alternate',
    easing: 'easeInOutCirc',
  });
});

Snap.load("assets/arm-06.svg", function(f) {
  topArm.append(f);

  anime({
    targets: '#top-arm',
    translateX: 20,
    loop: 2,
    duration: 1000,
    direction: 'alternate',
    easing: 'easeInOutCirc',
  });

  // anime({
  //   targets: '#left-finger',
  //   rotate: '30',
  //   loop: true,
  //   duration: 1000,
  //   transformOrigin: '100% 100% 0',
  //   direction: 'alternate',
  //   easing: 'easeInOutCirc',
  // });
  //
  // anime({
  //   targets: '#right-finger',
  //   rotate: '-10',
  //   loop: true,
  //   duration: 1000,
  //   transformOrigin: '10px 100px 0px',
  //   direction: 'alternate',
  //   easing: 'easeInOutCirc',
  // });
});

Snap.load("assets/arm-07.svg", function(f) {
  topRightArm.append(f);

  anime({
    targets: '#top-right-arm',
    translateX: 30,
    loop: 2,
    duration: 1000,
    direction: 'alternate',
    easing: 'easeInOutCirc',
  });
});

Snap.load("assets/arm-08.svg", function(f) {
  bottomRightArm.append(f);

  anime({
    targets: '#bottom-right-arm',
    translateY: 20,
    loop: 2,
    duration: 1000,
    direction: 'alternate',
    easing: 'easeInOutCirc',
  });
});

// Functions handling action blocks
var move = function(direction) {
  switch (direction) {
    case "up":
      anime({
        targets: '#bottom-left-arm',
        translateY: '-=25',
        duration: 1000,
        easing: 'easeInOutCirc',
      });
      break;
    case "down":
      anime({
        targets: '#bottom-left-arm',
        translateY: '+=25',
        duration: 1000,
        easing: 'easeInOutCirc',
      });
      break;
  }
};

var rub = function() {
  anime.timeline({
    direction: 'alternate',
    loop: 2,
    complete: function() {
      Snap.load("assets/girl-03.svg", function(f) {
        girl.select("svg").remove();
        girl.append(f);
      });
    }
  })
  .add({
    targets: '#left-arm',
    translateX: function() { return isExtended * 20 },
    rotate: 5,
    transformOrigin: function() { var newX = 35 - 20 * isExtended; return newX + 'px 25px 0'},
    easing: 'easeInOutCirc',
  }).add({
    targets: '#left-arm',
    translateX: function() { return isExtended * 20 },
    rotate: -5,
    transformOrigin: function() { var newX = 35 - 20 * isExtended; return newX + 'px 25px 0'},
    easing: 'easeInOutCirc',
  });

  anime({
    targets: '#bubble',
    loop: 2,
    opacity: 1,
    duration: 2000,
    scale: 1.1,
    direction: 'reverse',
    easing: 'easeInOutCirc',
    complete: function() {
      bubble.attr({
        opacity: 0
      });
    }
  });
};

var extend = function() {
  isExtended++;
  var newX = 37.96 - 20 * isExtended;
  var points = '79 51.24 79 40.93 ' + newX + ' 40.93 ' + newX + ' 51.24';
  anime({ targets: '#extended-part', points: points} );
  anime({ targets: '#left-arm' , translateX: '+=20'});
}
