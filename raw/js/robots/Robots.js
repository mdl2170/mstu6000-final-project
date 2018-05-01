/*
  ----------------------------------------------------
  Robots Challenge
  ----------------------------------------------------

  < Document challenge JS interface here >

  ----------------------------------------------------

  < Add documentation links here >

  ----------------------------------------------------
  LICENSING
  ----------------------------------------------------

  < Add open-source licensing references here >

  ----------------------------------------------------
 */
angular
		.module("mwc.robots", [ "mwc.photo", "mwc.utils", "mwc.video" ])

		.factory("RobotConstants", [ function() {
			return {
				DEBUG : false,
				CANVAS_WIDTH : 573,
				CANVAS_HEIGHT : 524,
				COMMAND_INTERVAL : 2000
			};
		} ])

		.factory(
				"RobotsSoundManager",
				[
						"resolveAllPromises",
						"SoundFactory",
						function(resolveAllPromises, SoundFactory) {

							var config = Robots.config;

							function RobotsSoundManager(onReady) {

								var path, loader, i, src, files = [], sounds = [];

								// List of sounds
								this.sounds = sounds;

								// Internal sound counter.
								this.index = 0;

								src = [ "LOSE_Sound", "Arm1", "Arm2", "Arm3",
										"Arm4", "blink", "blink_double",
										"empty", "neck1", "neck2", "plant1",
										"plant2", "plant3", "plant4", "water1",
										"water2", "water3", "waterEmpty",
										"WIN_Sound" ];

								path = config.paths.soundsPath + '/robots/';

								for (i = 0; i < src.length; i++) {
									var filename = path + src[i];
									loader = SoundFactory
											.createLoader(filename);
									files.push(loader);
								}

								resolveAllPromises(files)
										.then(
												function(results) {
													for (i = 0; i < results.length; ++i) {
														sounds
																.push(new SoundFactory(
																		results[i].resultData[0]));
													}

													if (onReady)
														onReady();
												});
							}

							function getCookie(name) {
								var value = "; " + document.cookie;
								var parts = value.split("; " + name + "=");
								if (parts.length == 2)
									return parts.pop().split(";").shift();
							}

							var createRepeatCookie = function(lev) {
								var cookieValue = getCookie("robot_repeat"
										+ lev);
								if (cookieValue != null
										&& parseInt(cookieValue) > 0
										&& !isNaN(cookieValue)) {
									console.log("COOKIE VALUE" + cookieValue)
									cookieValue = parseInt(cookieValue);
									cookieValue++;
									document.cookie = "robot_repeat" + lev
											+ "=" + cookieValue;
								} else {
									document.cookie = "robot_repeat"+ lev +"=1";
								}
							};
							var createCurrentLevelCookie = function(num) {
								document.cookie = "robot_level=" + num;
							};

							var getRepeatCookie = function(num) {
								var cookieValue = getCookie("robot_repeat"
										+ num);
								if (parseInt(cookieValue) != null) {
									cookieValue = parseInt(cookieValue);
									return cookieValue;
								}
							};

							RobotsSoundManager.prototype = {

								stopAllSounds : function() {
									for (var i = 0; i < this.sounds.length; ++i) {
										this.sounds[i].stop();
									}
								},

								// Index 0
								playLose : function() {
									console.log("LOSSSSSSSSSSSSSS");
									ga("send", "event", "garden_robot",
											"error", "garden_robot_level"
													+ getCookie("robot_level"));
									var sound = this.sounds[0];
									sound.play();
								},

								playWin : function() {
									ga("send", "event", "Project", "completed",
											"garden_robot_level"
													+ getCookie("robot_level"));
									createRepeatCookie(parseInt(getCookie("robot_level")))
									console.log("WINNNNNNNNNNNNN");
									var sound = this.sounds[18];
									sound.play();
								},

								// Arm 1 -> 4
								playArm : function(index) {
									var sound = this.sounds[index + 1];
									sound.play();
								},

								// Plant 10 -> 13
								playPlant : function(index) {
									var sound = this.sounds[index + 10];
									sound.play();
								},

								// Water 14 -> 16
								playWater : function(index) {
									var min = 14, max = 16;
									var range = max - min + 1;
									var sound = this.sounds[(index % range)
											+ min];

									sound.play();
								},

								// Water empty 17
								playWaterEmpty : function() {
									var sound = this.sounds[17];
									sound.play();
								}

							};

							return RobotsSoundManager;
						} ])

		.factory("RobotBackground", [ function() {

			var WIN_INDEX = 5;
			var LOSS_INDEX = 4;

			function RobotBackground(video, prefix, sources, isTablet) {
				this.video = video;
				this.prefix = prefix;
				this.sources = sources;
				this.isTablet = isTablet;

				// For tablets
				this.IOSAssets = null;
				this.sprite = null;
			}

			RobotBackground.prototype = {

				setIOSAssets : function(IOSAssets) {
					this.IOSAssets = IOSAssets;
				},

				reset : function() {
					this.playVideo(0);
				},

				showWin : function() {
					this.playVideo(WIN_INDEX);
				},

				showLoss : function() {
					this.playVideo(LOSS_INDEX);
				},

				getSources : function(index) {
					var src = this.prefix + "/" + this.sources[index];

					return [ {
						type : "video/webm",
						src : src + ".webm"
					}, {
						type : "video/ogg",
						src : src + ".ogv"
					}, {
						type : "video/mp4",
						src : src + ".mp4"
					} ];
				},

				playVideo : function(index) {
					if (this.isTablet) {
						if (index >= this.IOSAssets.length)
							return;
						this.sprite = this.IOSAssets[index];
						this.sprite.reset();

					} else {
						if (index > this.sources.length)
							return;
						this.video.src(this.getSources(index));
						this.video.play();
					}
				},

				setCol : function(col) {
					this.playVideo(col);
				},

				// tablet specific
				update : function() {
					if (this.sprite) {
						this.sprite.update();
					}
				},

				// tablet specific
				draw : function(ctx) {
					if (this.sprite) {
						this.sprite.draw(ctx, 0, 0);
					}
				}

			};

			return RobotBackground;
		} ])

		.factory(
				"WaterFlow",
				[
						"renderBuffer",
						"SpriteSheet",
						function(renderBuffer, SpriteSheet) {

							// Cropping info
							// 0-164
							// 165-295
							// 285-417
							// 418-574

							var OFFSETS = [ 0, -164, -285, -418 ];
							var WIDTHS = [ 164, 130, 142, 156 ];

							function WaterFlow(image) {
								this.sprite = new SpriteSheet(image, 7, 4, 574,
										100, 35, 0.5);
								this.canvasHeight = 100;

								// Current column / pot.
								this.col = 0;

								this.canvasList = this.createCanvases();
								this.isPlaying = false;
							}

							WaterFlow.prototype = {

								createCanvases : function() {
									var list = [];
									for (var i = 0; i < 4; ++i) {
										var canvas = document
												.createElement("canvas");
										canvas.width = WIDTHS[i];
										canvas.height = this.canvasHeight;
										canvas.style['min-width'] = canvas.style['max-width'] = canvas.width
												+ 'px';
										canvas.style['min-height'] = canvas.style['max-height'] = canvas.height
												+ 'px';

										// MWC Integration - re-position canvas
										// elements
										// here as we are not in an Angular UI
										// scope
										canvas.style.top = '297px';
										switch (i) {
										case 0:
											canvas.style.left = '0px';
											break;
										case 1:
											canvas.style.left = '164px';
											break;
										case 2:
											canvas.style.left = '285px';
											break;
										case 3:
											canvas.style.left = '418px';
											break;
										default:
											break;
										}

										Robots.canvasFrame.appendChild(canvas);
										list.push(canvas);
									}
									return list;
								},

								reset : function() {
									this.isPlaying = false;
									this.sprite.reset();
								},

								// MWC Integration - water flow needs clearning
								// on reset
								mwcReset : function(destinationContext) {
									this.reset();
									var offsetX = OFFSETS[this.col];
									var cvs = this.canvasList[this.col];
									var ctx = cvs.getContext("2d");
									ctx.clearRect(0, 0, cvs.width, cvs.height);
								},

								setCol : function(col) {
									this.col = col;
								},
								play : function() {
									this.sprite.reset();
									this.isPlaying = true;
								},
								update : function() {
									if (this.isPlaying) {
										this.sprite.update();
										if (this.sprite.frame === this.sprite.frames - 1) {
											this.isPlaying = false;
										}
									}
								},
								draw : function(destinationContext) {
									if (!this.isPlaying)
										return;

									var offsetX = OFFSETS[this.col];
									var cvs = this.canvasList[this.col];
									var ctx = cvs.getContext("2d");

									ctx.clearRect(0, 0, cvs.width, cvs.height);
									ctx.save();
									ctx.setTransform(1, 0, 0, 1, offsetX, -1);
									this.sprite.draw(ctx, 0, 0);
									ctx.restore();

									destinationContext.clearRect(-offsetX, 297,
											cvs.width, cvs.height);
									destinationContext.drawImage(cvs, -offsetX,
											297);
								}
							};

							return WaterFlow;
						} ])

		.factory(
				"Cups",
				[
						"SpriteSheet",
						function(SpriteSheet) {

							var OFFSETS = [ 0, -164, -285, -418 ];
							var WIDTHS = [ 164, 130, 139, 156 ];

							function Cups() {
								this.sprite1 = null;
								this.sprite2 = null;
								this.sprite = null;
								this.waterAmount = [ 0, 0, 0, 0 ];
								this.canvasHeight = 145;
								this.canvasList = this.createCanvases();
							}

							Cups.prototype = {

								createCanvases : function() {
									var list = [];
									for (var i = 0; i < 4; ++i) {
										var canvas = document
												.createElement("canvas");
										canvas.width = WIDTHS[i];
										canvas.height = this.canvasHeight;
										canvas.style['min-width'] = canvas.style['max-width'] = canvas.width
												+ 'px';
										canvas.style['min-height'] = canvas.style['max-height'] = canvas.height
												+ 'px';

										// MWC Integration - re-position canvas
										// elements
										// here as we are not in an Angular UI
										// scope
										canvas.style.top = '378px';
										switch (i) {
										case 0:
											canvas.style.left = '0px';
											break;
										case 1:
											canvas.style.left = '164px';
											break;
										case 2:
											canvas.style.left = '285px';
											break;
										case 3:
											canvas.style.left = '418px';
											break;
										default:
											break;
										}

										Robots.canvasFrame.appendChild(canvas);
										list.push(canvas);
									}
									return list;
								},

								reset : function() {
									this.sprite = null;
								},

								/**
								 * Set the water amount for each level and draw
								 * the final frame for that spritesheet
								 *
								 * @param {array}
								 *            amounts Water level amounts
								 * @param {CanvasRenderingContext2d}
								 *            ctx The water canvas
								 */
								setInitialWater : function(amounts,
										destinationContext) {

									this.waterAmount = amounts;

									for (var i = 0; i < this.waterAmount.length; ++i) {
										var amount = this.waterAmount[i];
										var tempSprite = amount > 1 ? this.sprite2
												: this.sprite1;
										var offsetX = OFFSETS[i];
										var cvs = this.canvasList[i];
										var ctx = cvs.getContext("2d");

										ctx.clearRect(0, 0, cvs.width,
												cvs.height);

										ctx.save();
										ctx
												.setTransform(1, 0, 0, 1,
														offsetX, 0);

										tempSprite
												.setFrame(amount ? tempSprite.frames - 1
														: 0);
										tempSprite.draw(ctx, 0, 0);

										ctx.restore();

										destinationContext.drawImage(cvs,
												-offsetX, 378);
									}
								},

								/**
								 * Check if every cup is at the target level.
								 *
								 * @return {boolean} True if combined result of
								 *         array is target total
								 */
								isSuccess : function() {
									var result = 0;
									for (var i = 0; i < this.waterAmount.length; ++i) {
										result += this.waterAmount[i];
									}
									return result === 8;
								},

								checkWaterLevels : function(soundManager) {

									var i, waterAmount, flower;

									for ( var i in this.waterAmount) {

										waterAmount = this.waterAmount[i];
										flower = this.flowers.flowers[i]; // todo:
																			// refactor

										// if the flower animation hasn't
										// started and
										// the cup is full, the flower can start
										// growing

										if (!flower.isPlaying
												&& waterAmount == 2) {
											flower.grow();

											// Play plant sound
											soundManager.playPlant(parseInt(i,
													10));
										}
									}
								},

								/**
								 * Increment water in pot if under target amount
								 * Set sprite to correct spritesheet for number
								 * animation
								 *
								 * @param {number}
								 *            col Column of pot to increment
								 * @returns {boolean|number} False if already at
								 *          max capacity
								 */
								incrementWaterLevelForCol : function(col) {

									if (this.waterAmount[col] >= 2) {
										return false;
									}

									this.col = col;
									this.sprite = ++this.waterAmount[col] > 1 ? this.sprite2
											: this.sprite1;
									this.sprite.reset();

									return this.waterAmount[col];
								},

								setSprites : function(image1, image2) {
									this.sprite1 = new SpriteSheet(image1, 7,
											5, 574, 145, 35, 0.5);
									this.sprite2 = new SpriteSheet(image2, 7,
											5, 574, 145, 35, 0.5);
								},

								update : function() {
									if (this.sprite) {
										this.sprite.update();
									}
								},

								draw : function(destinationContext) {
									if (!this.sprite)
										return;

									var offsetX = OFFSETS[this.col];
									var cvs = this.canvasList[this.col];
									var ctx = cvs.getContext("2d");

									ctx.clearRect(0, 0, cvs.width, cvs.height);
									ctx.save();
									ctx.setTransform(1, 0, 0, 1, offsetX, 0);

									this.sprite.draw(ctx, 0, 0);

									ctx.restore();

									destinationContext.clearRect(-offsetX, 378,
											cvs.width, cvs.height);
									destinationContext.drawImage(cvs, -offsetX,
											378);

								}
							};

							return Cups;
						} ])

		.factory(
				"Flowers",
				[

						"Flower",
						"SpriteSheet",
						function(Flower, SpriteSheet) {

							function Flowers(canvas) {

								this.flowers = [];

								this.canvas = canvas;
								this.context = this.canvas.getContext('2d');

							}

							Flowers.prototype = {

								setSprites : function(a, b, c, d) {

									var i = 0;

									this.flowers.push(new Flower(
											new SpriteSheet(a, 4, 10, 170, 325,
													40, 0.5), (i++ * 175)),
											new Flower(new SpriteSheet(b, 3,
													11, 200, 325, 33, 0.5),
													(i++ * 123)), new Flower(
													new SpriteSheet(c, 3, 7,
															170, 325, 21, 0.5),
													(i++ * 142)), new Flower(
													new SpriteSheet(d, 3, 10,
															165, 325, 30, 0.5),
													(i++ * 137)));
								},

								reset : function() {
									for (var i = 0; i < this.flowers.length; ++i) {
										this.flowers[i].reset();
									}
								},

								/**
								 * Updates all flowers
								 *
								 * @return {null}
								 */
								update : function() {
									for (var i = 0; i < this.flowers.length; ++i) {
										this.flowers[i].update();
									}
								},

								/**
								 * Draws all flowers
								 *
								 * @return {null}
								 */
								draw : function(context) {

									// only clear the used area
									this.context.clearRect(0, 120,
											this.canvas.width, 350);

									// draw each flower
									for (var i = 0; i < this.flowers.length; ++i) {
										if (this.flowers[i].isPlaying)
											this.flowers[i].draw(this.context);
									}
								}
							}

							return Flowers;

						} ])

		.factory("Flower", [ function() {

			var DEFAULT_OFFSET_Y = 99;

			function Flower(sprite, offsetX, offsetY) {
				this.sprite = sprite;
				this.offsetX = offsetX;
				this.offsetY = offsetY || DEFAULT_OFFSET_Y;
				this.isPlaying = false;
				this.growthDelay = 0;
			}

			Flower.prototype = {

				update : function() {
					if (this.isPlaying && (--this.growthDelay <= 0)) {
						this.sprite.update();
					}
					return this.isPlaying;
				},
				reset : function() {
					this.isPlaying = false;
					this.sprite.reset();
				},
				grow : function() {
					this.isPlaying = !this.isPlaying;
					this.growthDelay = 60;
					if (!this.isPlaying)
						this.sprite.reset();
				},
				draw : function(ctx) {
					if (this.isPlaying && (--this.growthDelay <= 0)) {
						this.sprite.draw(ctx, this.offsetX, this.offsetY);
					}
				}
			};

			return Flower;
		} ])

		.factory(
				"RobotsGame",
				[
						"RobotConstants",
						"Flower",
						"WaterFlow",
						"Cups",
						"Flowers",
						"SpriteSheet",
						"renderBuffer",
						"timeoutStore",
						"$window",
						"RobotsSoundManager",
						function(RobotConstants, Flower, WaterFlow, Cups,
								Flowers, SpriteSheet, renderBuffer,
								timeoutStore, $window, RobotsSoundManager) {

							var Modal = {
								COMPLETE : "complete",
								INTERSTITIAL : "interstitial",
								RETRY : "retry"
							};

							function RobotsGame(isTablet) {
								this.isTablet = isTablet;

								// Create canvas elements
								this.canvas = Robots.canvas;
								this.canvasContext = this.canvas
										.getContext("2d");
								this.waterCanvas = this.createCanvas();
								this.waterCanvas.style.left = "0px";
								this.waterCanvas.style.top = "0px";

								this.waterCanvasContext = this.waterCanvas
										.getContext("2d");
								this.videoCanvas = this.createCanvas();
								this.videoCanvas.style.left = "0px";
								this.videoCanvas.style.top = "0px";
								this.videoCanvasContext = this.videoCanvas
										.getContext("2d");

								// For open / close of modals
								this.toggleModal = null;

								// Water flow object shows cropped sprite sheet
								// of water animation
								this.waterFlow = null;

								// Background animation controller
								this.robotBackground = null;

								// Cups manager handles sprite and water level
								this.cups = new Cups();

								// Create flower canvas elements (after cups)
								this.flowerCanvas = this.createCanvas();
								this.flowerCanvas.style.left = "0px";
								this.flowerCanvas.style.top = "0px";
								this.flowerCanvasContext = this.flowerCanvas
										.getContext("2d");

								// Flowers contains the four flower objects for
								// playing animation
								this.flowers = new Flowers(this.flowerCanvas);

								this.cups.flowers = this.flowers;

								// Flag for clear flower canvas when flowers
								// animating.
								// this.isDrawFlowers = false;

								// Command list.
								this.commands = [];
								// Current command index
								this.commandIndex = 0;

								// Above which pot?
								this.currentCol = 0;

								// Backup sprite sheet assets for IOS
								this.IOSAssets = [];

								// Five different levels
								// 1- add water, move right, num, 11 blocks
								// 2- add water, move right, num, 11 blocks
								// 3- add water, move right, num, loop, 4 blocks
								// 4- add water, move right, num, loop, 7 blocks
								// 5- add water, move right, num, loop, if, 5
								// blocks

								// Levels for each water amount
								this.levels = [ [ 0, 0, 0, 0 ], [ 1, 0, 1, 0 ],
										[ 0, 0, 0, 0 ], [ 1, 0, 1, 0 ],
										[ 1, 2, 1, 0 ] ];

								this.level = Robots
										&& Robots.hashLevel !== undefined ? Robots.hashLevel
										: 0;

								// Preserve scope of update method for
								// requestAnimationFrame
								this.update = this.update.bind(this);

								// Init sounds
								this.soundManager = new RobotsSoundManager();
							}

							RobotsGame.prototype = {

								setIOSAssets : function(image, rows, cols,
										numFrames) {
									var robotSheet = new SpriteSheet(image,
											rows, cols, 574, 524, numFrames, 1)
									this.IOSAssets.push(robotSheet);
								},

								createCanvas : function(width, height) {
									var canvas = document
											.createElement("canvas");
									canvas.width = width
											|| RobotConstants.CANVAS_WIDTH;
									canvas.height = height
											|| RobotConstants.CANVAS_HEIGHT;
									canvas.style['min-width'] = canvas.style['max-width'] = canvas.width
											+ 'px';
									canvas.style['min-height'] = canvas.style['max-height'] = canvas.height
											+ 'px';
									Robots.canvasFrame.appendChild(canvas);
									return canvas;
								},

								setToggleModalCallback : function(
										toggleModalCallback) {
									this.toggleModal = toggleModalCallback;
								},

								setVideoController : function(robotBackground) {
									this.robotBackground = robotBackground;
									this.robotBackground
											.setIOSAssets(this.IOSAssets);
								},

								setFlowerSprites : function(a, b, c, d) {
									// relay
									this.flowers.setSprites(a, b, c, d);
								},

								getLevelDef : function() {
									var level = this.levels[this.level];
									return level.slice(0);
								},

								setCupSprites : function(image1, image2) {
									this.cups.setSprites(image1, image2);
									this.cups.setInitialWater(this
											.getLevelDef(),
											this.waterCanvasContext);
								},

								setWaterFlowSprite : function(image) {
									this.waterFlow = new WaterFlow(image);
								},

								// MWC Integration - not required
								// setBlocklyProgram: function (blocklyProgram)
								// {
								// this.blocklyProgram = blocklyProgram;
								// },

								/**
								 * After eval, reset cup water levels and
								 * current column
								 */
								softReset : function() {
									this.currentCol = 0;
									this.cups.waterAmount = this.getLevelDef();
								},

								destroy : function() {
									if (this.requestId) {
										cancelAnimationFrame(this.requestId);
										this.requestId = null;
									}

									timeoutStore.clearAll();

									// Clear spritesheets from memory
									SpriteSheet.disposeAll();

									this.soundManager.stopAllSounds();
								},

								/**
								 * Restart, set back to first level and reset
								 * the game
								 */
								restart : function(noLevelRestart) {
									if (!noLevelRestart)
										this.level = 0;
									this.reset();
								},

								reset : function() {
									// Reset the blockly program
									this.stopProgram();
									// Clear command queue
									this.commands = [];
									this.commandIndex = 0;
									// Set back to start
									this.currentCol = 0;
									this.robotBackground.reset();
									// Reset flowers
									this.flowers.reset();
									// Reset water flow
									this.waterFlow.mwcReset(this.canvasContext);
									// Reset cups water levels
									this.cups.reset();
									// Clear main canvas
									this.canvasContext.clearRect(0, 0,
											RobotConstants.CANVAS_WIDTH,
											RobotConstants.CANVAS_HEIGHT);
									// Clear water canvas
									this.waterCanvasContext.clearRect(0, 0,
											RobotConstants.CANVAS_WIDTH,
											RobotConstants.CANVAS_HEIGHT);
									// Set cup initial levels
									this.cups.setInitialWater(this
											.getLevelDef(),
											this.waterCanvasContext);
									// Clear timeouts
									timeoutStore.clearAll();
								},

								// Start the animation loop
								init : function() {
									if (this.requestId) {
										cancelAnimationFrame(this.requestId);
										this.requestId = null;
									}

									this.robotBackground.reset();
									this.update();
								},

								draw : function() {
									// If IOS, we need to update robot
									// background sprite sheets
									if (this.IOSAssets.length > 0) {
										this.robotBackground.update();
										this.robotBackground
												.draw(this.videoCanvasContext);
									}

									// Draw water flow animation
									this.waterFlow.update();
									this.waterFlow.draw(this.canvasContext);

									// Draw cup water levels
									this.cups.update();
									this.cups.draw(this.waterCanvasContext);

									this.flowers.update();
									this.flowers.draw(this.canvasContext);

								},

								// Main loop
								update : function() {
									this.draw();
									this.requestId = requestAnimationFrame(this.update);
								},

								// MWC Integration - not required
								// User-initiated method to start game running
								// startAnimation: function () {
								// this.blocklyProgram.run();
								// },

								/**
								 * User-initiated method to start next level
								 */
								nextLevel : function() {
									++this.level;
									if (this.level >= this.levels.length - 1)
										return this.levels.length - 1;
									else
										this.level;// %= this.levels.length;
								},

								/**
								 * Bring in correct modal after timeout
								 */
								timeoutEndLevel : function(isSuccess) {
									var modal;
									if (isSuccess) {
										modal = Modal.INTERSTITIAL;
										if (this.level === this.levels.length - 1) {
											modal = Modal.COMPLETE;
										}
									} else {
										modal = Modal.RETRY;
									}

									timeoutStore.createTimeout(
											this.toggleModal, this, 4000,
											[ modal ]);
								},

								/**
								 * Check for win / fail
								 */
								checkEndResult : function() {

									// If we haven't reached the final pot, fail
									// with interstitial message.
									if (this.currentCol < 3) {
										// Show retry modal after timeout.
										timeoutStore
												.createTimeout(
														this.showRetryModal,
														this, 2000);
									} else {
										// Check whether all pots filled to two
										// for success.
										var isSuccess = this.cups.isSuccess();
										if (isSuccess) {
											// Play win animation
											this.robotBackground.showWin();

											// Play win sound
											this.soundManager.playWin();

										} else {
											// Play fail animation
											this.robotBackground.showLoss();

											// Play water empty.
											this.soundManager.playWaterEmpty();
										}
										this.timeoutEndLevel(isSuccess);
									}
								},

								// MWC Integration - not required
								// Execute next command in command list
								// Run by blocklyProgram
								// runCommand: function () {
								//
								// var command =
								// this.commands[this.commandIndex++];
								// // Only animation commands are "moveRight"
								// and "addWaterToPot"
								// var args =
								// Array.prototype.slice.call(arguments, 0);
								// command.apply(this, args);
								//
								// // Check will finish?
								// if (this.commandIndex ===
								// this.commands.length) {
								// timeoutStore.createTimeout(this.checkEndResult,
								// this, RobotConstants.COMMAND_INTERVAL);
								// }
								// },

								/**
								 * Reset and stop blockly program.
								 */
								stopProgram : function() {
									// MWC Integration - not required
									// this.blocklyProgram.commandList = [];
									// this.blocklyProgram.commandPointer = 0;
									// this.blocklyProgram.stop();
								},

								/**
								 * @return {Boolean} indicating whether the last
								 *         command has been executed
								 */
								isLastCommand : function() {
									return this.commandIndex === this.commands.length;
								},

								/**
								 * Trigger move right animation unless we've
								 * reached end
								 */
								moveRightCommand : function() {

									// Extra check for pre-filled cups
									// this.cups.checkWaterLevels(this.soundManager);

									// Play sound (desktop video has sound
									// embedded, so skip)
									if (this.isTablet) {
										timeoutStore.createTimeout(
												this.soundManager.playArm,
												this.soundManager, 450,
												[ this.currentCol ]);
									}

									// Move to next pot if we can.
									if (this.currentCol < 3) {
										++this.currentCol;
										this.robotBackground.setCol(
												this.currentCol, null, null);
									} else {
										// Note: This silently fails, we dont
										// stop the program
									}
								},

								needsWaterCommand : function() {
									return this.cups.waterAmount[this.currentCol] < 2;
								},

								anyMoreWaterRequiredCommand : function() {
									if ((this.cups.waterAmount[0] < 2)
											|| (this.cups.waterAmount[1] < 2)
											|| (this.cups.waterAmount[2] < 2)
											|| (this.cups.waterAmount[3] < 2))
										return true;

									return false;
								},

								growFlower : function(col) {
									// Grow flower.
									flower = this.flowers.flowers[col];

									// if the flower animation hasn't started
									// and
									// the cup is full, the flower can start
									// growing
									if (!flower.isPlaying) {
										flower.grow();

										// Play plant sound.
										timeoutStore.createTimeout(
												this.soundManager.playPlant,
												this.soundManager, 750,
												[ this.currentCol ]);
									}
								},

								/**
								 * Attempt to add water to the pot Play the
								 * water flow animation or or reset the blockly
								 * program
								 *
								 * @param {boolean}
								 *            isSuccess Is total water to add
								 *            the correct amount?
								 *
								 */
								addWaterCommand : function(isSuccess) {

									var waterLevel, flower, target = 2;

									this.waterFlow.setCol(this.currentCol);
									this.waterFlow.play();

									// Play water sound
									this.soundManager
											.playWater(this.currentCol);

									// If we can add to the cup
									waterResult = this.cups
											.incrementWaterLevelForCol(this.currentCol);

									if (waterResult === target) {
										// We will reach the target without
										// going over?
										// And it's the last cup.
										if (isSuccess) {

											timeoutStore.createTimeout(
													this.growFlower, this,
													2000, [ this.currentCol ]);
										}

									} else if (!waterResult
											&& !this.isLastCommand()) {

										// Overflow !
										// But we're skipping this if it's the
										// end of the program,
										// in which case the failure modal will
										// appear in any case.

										timeoutStore
												.createTimeout(
														this.showRetryModal,
														this, 2000);

									}
								},

								showRetryModal : function() {
									this.stopProgram();
									this.toggleModal(Modal.RETRY);
									// Play lose sound
									this.soundManager.playLose();
								},

							// MWC Integration - not required
							// Move to the next pot (without animation)
							// Store the command for use by the blockly program
							// @param {number} blockId Blockly block id
							// moveRight: function (blockId) {
							//
							// // Temporary shift to right
							// // Reset by softReset method
							// ++this.currentCol;
							//
							// // Store command for animation.
							// this.commands.push(this.moveRightCommand);
							// this.blocklyProgram.addCommand({
							// blockId: blockId,
							// delay: RobotConstants.COMMAND_INTERVAL,
							// command: this.runCommand.bind(this)
							// });
							// },

							// MWC Integration - not required
							// Add a command for each unit of water to be added.
							// @param {number} blockId Blockly block id
							// @param {number} units Number of water units to be
							// added
							//
							// addWaterToPot: function (blockId, units) {
							// // Temporary increase in water amount
							// // Reset by softReset method
							// this.cups.waterAmount[this.currentCol] += units;
							//
							// // Compare starting amount with added units for
							// success.
							// var isSuccess =
							// (this.cups.waterAmount[this.currentCol] === 2);
							//
							// // Store for animation
							// for(var i = 0; i < units; ++i) {
							// this.commands.push(this.addWaterCommand);
							// this.blocklyProgram.addCommand({
							// blockId: blockId,
							// delay: RobotConstants.COMMAND_INTERVAL,
							// command: this.runCommand.bind(this),
							// parameters: [isSuccess]
							// });
							// }
							// },

							// MWC Integration - not required
							// If statement from blockly code
							// @param {number} blockId Blockly block id
							// @returns {boolean} True if water needs to be
							// added to pot.
							// needsWater: function (blockId) {
							// // Get current col water level
							// var isNeedWater =
							// this.cups.waterAmount[this.currentCol] < 2;
							//
							// this.commands.push(this.needsWaterCommand);
							// this.blocklyProgram.addCommand({
							// blockId: blockId,
							// delay: RobotConstants.COMMAND_INTERVAL,
							// command: this.runCommand.bind(this)
							// });
							//
							// return isNeedWater;
							// },

							// MWC Integration - not required
							// For highlighting blockly element on each loop
							// add noop command to the blockly program
							// param {number} blockId Blockly block id
							// repeat: function (blockId) {
							// this.blocklyProgram.addCommand({
							// blockId: blockId,
							// delay: RobotConstants.COMMAND_INTERVAL,
							// command: function () {}
							// });
							// }
							};

							return RobotsGame;
						} ])

		.factory(
				"RobotsController",
				[
						"RobotConstants",
						"RobotBackground",
						"RobotsGame",
						"$timeout",
						"$window",
						"loadImageFile",
						"loadImageUrl",
						"resolveAllPromises",
						"safeParse",
						"mwcVideojsApi",
						function(RobotConstants, RobotBackground, RobotsGame,
								$timeout, $window, loadImageFile, loadImageUrl,
								resolveAllPromises, safeParse, mwcVideojsApi) {

							// Define scope locally as not a true angular
							// context
							var $scope = Robots.controller;

							// Define required config paths locally
							var config = Robots.config;

							// An alias to make the Blockly code look nice
							// MWC - Updated to RobotsScope to not confuse root
							$window["RobotsScope"] = $scope;

							var detectIE = function() {
								var ua = window.navigator.userAgent;
								var msie = ua.indexOf('MSIE ');
								var trident = ua.indexOf('Trident/');

								if (msie > 0) {
									// IE 10 or older => return version number
									return parseInt(ua.substring(msie + 5, ua
											.indexOf('.', msie)), 10);
								}

								if (trident > 0) {
									// IE 11 (or newer) => return version number
									var rv = ua.indexOf('rv:');
									return parseInt(ua.substring(rv + 3, ua
											.indexOf('.', rv)), 10);
								}

								// other browser
								return false;
							};

							// Initializations
							var isTablet = navigator.userAgent
									.match(/iPad|Android/i) != null, isSafari = /^((?!chrome).)*safari/i
									.test(navigator.userAgent), isIE = detectIE();

							isTablet = isTablet || isSafari || isIE;

							$scope.code = "";
							$scope.isRunning = false;

							// Draw end video frame to canvas on video end.
							$scope.handleVideoEnded = function(e) {
								$scope.videoCanvasContext.drawImage(e.target,
										0, 0);
							};
							// Clear the video canvas to show the playing video
							// beneath.
							$scope.handleVideoPlaying = function() {
								var player = document
										.querySelector('.video-js');
								if (player) {
									player.style.display = 'block';
									player.style.visibility = 'visible';
								}
								$scope.videoCanvasContext.clearRect(0, 0, 573,
										524);
							};

							// Initialize video dom elements
							var videoElement = document.createElement('video');
							videoElement.setAttribute('class',
									'video-js vjs-default-skin');
							videoElement.setAttribute('width', '574');
							videoElement.setAttribute('height', '524');
							videoElement.innerHTML = '<source src="/raw/js/robots/images/0_A.webm" type="video/webm" /><source src="/raw/js/robots/images/0_A.ogv" type="video/ogg" /><source src="/raw/js/robots/images/0_A.mp4" type="video/mp4" />';

							var videoDiv = document.createElement('div');
							videoDiv.setAttribute('class', 'canvas-frame');
							videoDiv.appendChild(videoElement);

							Robots.canvas.parentNode.appendChild(videoDiv);
							Robots.canvasFrame = videoDiv;

							// Main app
							$scope.robotsGame = new RobotsGame(isTablet);

							// Once video is ready, initialise the video
							// background controller and listeners.
							mwcVideojsApi.link(videoElement, function(
									robotVideo) {

								$scope.robotVideo = robotVideo;
								var robotBackground = new RobotBackground(
										$scope.robotVideo,
										config.paths.robotsImagesPath, [ "0_A",
												"A_B", "B_C", "C_D", "D_loss",
												"D_win" ], isTablet);

								$scope.robotsGame
										.setVideoController(robotBackground);
								if (!isTablet) {
									// Add listeners to playing and end of video
									// for drawing and clearing video canvas.
									$timeout(function() {
										$scope.robotVideo.on("ended",
												$scope.handleVideoEnded
														.bind($scope));
										$scope.robotVideo.on("playing",
												$scope.handleVideoPlaying
														.bind($scope));
									});
								}

								// console.log(">>>", robotVideo, videoElement);
							});

							// Remaining blocks left to place
							$scope.remainingBlockText = "";
							$scope.updateCapacity = function() {
								var capacity = $scope.blocklyApi.mainWorkspace
										.remainingCapacity();
								$scope.remainingBlockText = capacity === 1 ? capacity
										+ " block"
										: capacity + " blocks";
							};

							// Modal open booleans
							$scope.interstitialOpen = false;
							$scope.retryOpen = false;
							$scope.completeOpen = false;

							// Toggle retry modal method - invoked by RobotsGame
							// callback
							$scope.toggleModal = function(modal) {
								var prop = modal + "Open";
								if (!$scope.hasOwnProperty(prop)) {
									throw new Error(
											"modal property does not exist");
								} else {
									$timeout(function() {
										$scope[prop] = !$scope[prop];
									});
								}
							};
							$scope.robotsGame
									.setToggleModalCallback($scope.toggleModal);

							// Canvas elements
							// Link canvas elements created in RobotsGame
							$scope.canvas = $scope.robotsGame.canvas;
							$scope.waterCanvas = $scope.robotsGame.waterCanvas;
							$scope.flowerCanvas = $scope.robotsGame.flowerCanvas;
							$scope.videoCanvas = $scope.robotsGame.videoCanvas;
							$scope.videoCanvasContext = $scope.videoCanvas
									.getContext("2d");

							// Showing share modal boolean
							$scope.shareOpen = false;

							// Load tablet assets (spritesheets) if necessary
							if (isTablet) {
								resolveAllPromises(
										[
												loadImageUrl(config.paths.robotsImagesPath
														+ "/0_A_ios.png"),
												loadImageUrl(config.paths.robotsImagesPath
														+ "/A_B_ios.png"),
												loadImageUrl(config.paths.robotsImagesPath
														+ "/B_C_ios.png"),
												loadImageUrl(config.paths.robotsImagesPath
														+ "/C_D_ios.png") ])
										.then(
												function(results) {
													var i = 0;
													// Create sprite sheets
													// Parameters [image, rows,
													// cols, numFrames]
													$scope.robotsGame
															.setIOSAssets(
																	results[i++].resultData[0],
																	2, 5, 10);
													$scope.robotsGame
															.setIOSAssets(
																	results[i++].resultData[0],
																	1, 8, 8);
													$scope.robotsGame
															.setIOSAssets(
																	results[i++].resultData[0],
																	1, 8, 8);
													$scope.robotsGame
															.setIOSAssets(
																	results[i++].resultData[0],
																	1, 8, 8);
												});
							}

							// Loads the robot sprite sheets
							resolveAllPromises(
									[
											loadImageUrl(config.paths.robotsImagesPath
													+ "/flower_a.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/flower_b.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/flower_c.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/flower_d.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/water_flow.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/cups_0to1.png"),
											loadImageUrl(config.paths.robotsImagesPath
													+ "/cups_1to2.png") ])
									.then(
											function(results) {
												var i = 0;
												// Add the flower images
												$scope.robotsGame
														.setFlowerSprites(
																results[i++].resultData[0],
																results[i++].resultData[0],
																results[i++].resultData[0],
																results[i++].resultData[0]);
												$scope.robotsGame
														.setWaterFlowSprite(results[i++].resultData[0]);
												$scope.robotsGame
														.setCupSprites(
																results[i++].resultData[0],
																results[i++].resultData[0]);
												$scope.robotsGame.init();
											});

							// MWC Integration - not required
							// Eval method
							// $scope.moveRight = function(blockId) {
							// $scope.robotsGame.moveRight(blockId);
							// };

							// MWC Integration - not required
							// Eval method
							// $scope.addWaterToPot = function(blockId, units) {
							// $scope.robotsGame.addWaterToPot(blockId, units);
							// };

							// MWC Integration - not required
							// Eval method
							// $scope.needsWater = function (blockId) {
							// return $scope.robotsGame.needsWater(blockId);
							// };

							// MWC Integration - not required
							// Eval method for highlighting block on repeat
							// $scope.repeat = function (blockId) {
							// $scope.robotsGame.repeat(blockId);
							// };

							// MWC Integration - not required
							// $scope.togglePlay = function () {
							// if ($scope.isRunning) {
							// $scope.isRunning = false;
							// $scope.robotsGame.reset();
							// } else {
							// if ($scope.code == '') {
							// $scope.robotsGame.checkEndResult();
							// return;
							// }
							// eval($scope.code);
							//
							// $scope.isRunning = true;
							// $scope.robotsGame.softReset();
							// $scope.robotsGame.startAnimation();
							// }
							// };

							$scope.nextLevel = function() {
								$scope.isRunning = false;
								$scope.interstitialOpen = false;

								$scope.robotsGame.nextLevel();
								$scope.robotsGame.reset();

								// MWC Integration - not required
								// $scope.resetBlockly();
							};

							$scope.tryAgain = function() {
								$scope.isRunning = false;
								$scope.robotsGame.reset();
								$scope.retryOpen = false;
							};

							$scope.restartGame = function(noLevelRestart) {
								$scope.isRunning = false;
								$scope.robotsGame.restart(noLevelRestart);

								// MWC Integration - not required
								// $scope.resetBlockly();

								$scope.completeOpen = false;
							};

							$scope.openShareModal = function() {
								$scope.shareOpen = true;
							};

							// TODO: Replace as not true angular scope
							// When things go kaput
							// $scope.$on("$destroy", function() {
							// $scope.robotsGame.destroy();
							// delete $window["RobotsScope"];
							// });

							// MWC Integration - Let everyone know we exist
							$scope.exists = true;

						} ]);

var Robots = {};
(function(root) {
	"use strict";

	root.controller = {
		exists : false
	};

	root.config = {
		paths : {
			robotsImagesPath : '/raw/js/robots/images',
			soundsPath : '/raw/js/robots/sounds'
		}
	};

	root.data = {
		completed : false,
		flowered : [ false, false, false, false ],
		programArray : [],
		reset : false
	};

	root.log = function(text) {
		// For debug, uncomment the logging
		// console.log(text);
	};

	function getCookie(name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
	}

	root.createRepeatCookie = function(lev) {
		var cookieValue = getCookie("robot_repeat" + lev);
		if (cookieValue != null && parseInt(cookieValue) > 0
				&& !isNaN(cookieValue)) {
			console.log("COOKIE VALUE" + cookieValue)
			cookieValue = parseInt(cookieValue);
			cookieValue++;
			document.cookie = "robot_repeat" + lev + "=" + cookieValue;
		} else {
			document.cookie = "robot_repeat=1";
		}
	};
	root.createCurrentLevelCookie = function(num) {
		document.cookie = "robot_level=" + num;
	};

	root.getRepeatCookie = function(num) {
		var cookieValue = getCookie("robot_repeat" + num);
		if (parseInt(cookieValue) != null) {
			cookieValue = parseInt(cookieValue);
			return cookieValue;
		}
	};

	root.play = function(callback, highlight) {
		root.log('FLOZ: Robots.play');
		root.utils.hideTooltip();

		var callbackDelay = 2000;
		var callbackFalse = function(reason) {

			var failTimeout = 7000;
			if (root.controller.robotsGame.currentCol < 3) {
				failTimeout = 0;
				root.controller.robotsGame.soundManager.playLose();
			} else {
				// Animation for failure only exists if reached the last cup
				root.controller.robotsGame.robotBackground.showLoss();
				root.controller.robotsGame.soundManager.playWaterEmpty();
			}

			setTimeout(function() {

				root.utils.showTooltip();
				root.controller.tryAgain();
				root.data.reset = false;
				callback(false, reason);

			}, failTimeout);
		}

		var callbackTrue = function() {

			var succeedTimeout = 5000;
			root.controller.robotsGame.robotBackground.showWin();
			root.controller.robotsGame.soundManager.playWin();

			setTimeout(
					function() {
						root.utils.showTooltip();
						if (root.controller.robotsGame.level == (root.controller.robotsGame.levels.length - 1))
							root.data.completed = true;

						if (root.data.completed == true) {
							root.controller.restartGame(true);
						} else
							root.controller.nextLevel();

						root.data.reset = false;
						callback(true);

					}, succeedTimeout);
		};

		var noMoreWater = function(step, repeatArray) {

			// Take a copy of the repeatArray
			var repeatArrayClone = repeatArray.slice(0);

			//
			// Perform a dummy run of the program from this
			// point forwards, looking for other instances
			// of adding more water before moving along...
			//

			var curStep = step + 1;
			while (curStep < root.data.programArray.length) {

				if (root.data.programArray[curStep].action == 'add-water')
					return false;
				else if (root.data.programArray[curStep].action == 'move-right')
					return true;
				else if (root.data.programArray[curStep].action == 'if-start') {
					// 'IF' is safe to assume it won't result in overfill
					curStep = root.data.programArray[curStep].stop;
				} else if (root.data.programArray[curStep].action == 'repeat-start') {

					if (root.data.programArray[curStep].units > 0)
						repeatArrayClone
								.push(root.data.programArray[curStep].units);
					else
						curStep = root.data.programArray[curStep].stop;

				} else if (root.data.programArray[curStep].action == 'repeat-stop') {

					var count = repeatArrayClone.pop();
					count--;
					if (count > 0) {
						repeatArrayClone.push(count);
						curStep = root.data.programArray[curStep].start;
					}

				}

				curStep++;
			}

			return true;
		};

		var curStep = 0;
		var repeatArray = [];
		var playStep = function() {

			var playDelay = 3000;

			if (root.data.reset) {
				root.data.reset = false;
				return;
			}

			if (curStep >= root.data.programArray.length) {

				// Fail if not all cups are filled
				if (root.controller.robotsGame.anyMoreWaterRequiredCommand()) {
					setTimeout(function() {
						callbackFalse('drought');
					}, callbackDelay);
					return;
				}

				// OK then, stage complete
				setTimeout(callbackTrue, callbackDelay);
				return;
			}

			// Highlight blockly
			highlight('' + root.data.programArray[curStep].id);

			// Execute command
			if (root.data.programArray[curStep].action == 'add-water') {

				// Are we overfilling cup
				var overfilled = (!root.controller.robotsGame
						.needsWaterCommand());

				// OK, add some water
				root.controller.robotsGame.addWaterCommand(noMoreWater(curStep,
						repeatArray));

				// Now fail if overfilled
				if (overfilled) {
					setTimeout(function() {
						callbackFalse('monsoon');
					}, callbackDelay);
					return;
				}

				// Are we flowered?
				if (!root.controller.robotsGame.needsWaterCommand())
					root.data.flowered[root.controller.robotsGame.currentCol] = true;

			} else if (root.data.programArray[curStep].action == 'move-right') {

				// Do we need to flower? (for levels where no water required)
				var moveRightDelay = 0;
				if (root.data.flowered[root.controller.robotsGame.currentCol] == false) {
					if (!root.controller.robotsGame.needsWaterCommand()) {
						moveRightDelay = 2000;
						root.controller.robotsGame
								.growFlower(root.controller.robotsGame.currentCol);
					}
				}

				// Now, move along
				setTimeout(root.controller.robotsGame.moveRightCommand(),
						moveRightDelay);

			} else if (root.data.programArray[curStep].action == 'if-start') {
				playDelay = 1000;
				if (!root.controller.robotsGame.needsWaterCommand())
					curStep = root.data.programArray[curStep].stop;

			} else if (root.data.programArray[curStep].action == 'repeat-start') {

				if (root.data.programArray[curStep].units > 0)
					repeatArray.push(root.data.programArray[curStep].units);
				else
					curStep = root.data.programArray[curStep].stop;

			} else if (root.data.programArray[curStep].action == 'repeat-stop') {

				var count = repeatArray.pop();
				count--;
				if (count > 0) {
					repeatArray.push(count);
					curStep = root.data.programArray[curStep].start;
					highlight('' + root.data.programArray[curStep].id);
				}
			}

			curStep++;
			setTimeout(playStep, playDelay);
		};

		playStep();
	};

	root.playReset = function() {
		root.data.reset = true;
		root.controller.robotsGame.reset();
		root.utils.showTooltip();
	};

	/**
	 * Reset the entire workspace
	 */
	root.reset = function() {
		// Get rid of the "Done" button
		var doneButton = document
				.querySelector('.step-selector.phony button.done');
		if (doneButton) {
			doneButton.style.visibility = "hidden";
		}

		if (root.controller.exists === true) {
		}
	};

	/**
	 * Set the challenge canvas
	 */
	root.setCanvas = function(canvas, width, height) {
		// Set the canvas into the root
		root.canvas = canvas;

		// Desired canvas size
		var width = 574;
		var height = 524;
		root.canvas.width = width;
		root.canvas.height = height;
		root.canvas.style['min-width'] = root.canvas.style['max-width'] = ''
				+ width + 'px';
		root.canvas.style['min-height'] = root.canvas.style['max-height'] = ''
				+ height + 'px';

		// Bootstrap pseudo (DOM'less) angular
		var injector = angular.injector([ 'mwc.robots', 'ng' ]);
		var service = injector.get('RobotsController');
	};

	root.setLevel = function(level) {
		root.controller.robotsGame.level = level;
		root.controller.robotsGame.reset();
	};

	/**
	 * Make the canvas visible
	 */
	root.show = function() {
		if (root.canvas)
			root.canvas.style.visibility = "visible";
	};

	/**
	 * Updated values from blockly actions
	 */
	root.updates = function(values) {
		root.log('FLOZ: Robots.updates: from: ' + values.from + ', units: '
				+ values.units);
		for (var i = 0; i < values.units; i++)
			root.data.programArray.push({
				action : values.from,
				id : values.id
			});
	};

	/**
	 * Begin receiving updated values from logic blockly
	 */
	root.updatesLogicStart = function(values) {
		root.log('FLOZ: Robots.updatesLogicStart: from: ' + values.from
				+ ', units: ' + values.units);
		root.data.logicArray.push(root.data.programArray.length);
		root.data.programArray.push({
			action : values.from,
			id : values.id,
			units : values.units
		});
	};

	/**
	 * Finish receiving updated values from logic blockly
	 */
	root.updatesLogicStop = function(values) {
		root.log('FLOZ: Robots.updatesLogicStop: from: ' + values.from);
		var startIndex = root.data.logicArray.pop();
		root.data.programArray[startIndex].stop = root.data.programArray.length;
		root.data.programArray.push({
			action : values.from,
			start : startIndex,
			units : 0
		});
	};

	/**
	 * Begin receiving updated values from blockly
	 */
	root.updatesStart = function() {
		root.log('FLOZ: Robots.updatesStart');
		root.data.logicArray = [];
		root.data.flowered = [ false, false, false, false ];
		root.data.programArray = [];
	};

	/**
	 * Finish receiving updated values from blockly
	 */
	root.updatesStop = function() {
		root.log('FLOZ: Robots.updatesStop');
		root.data.logicArray = null;
	};

	root.completeChallenge = function() {
		var img = document.querySelector('.done-overlay img.poster');
		if (img) {
			img.src = root.config.paths.robotsImagesPath + '/poster.png';
		}
		document.querySelector(".challenge").style.height = "600px";
	};

	root.restartTracking = function (){
//		THIS IS WHERE I LOST MY MIND...
		setTimeout(function () {
			var projectName = document.querySelector('.project-name');

			var aTracked = document.querySelectorAll('.tracking');
			var socials = document.querySelectorAll('.social-icons button');


			if (aTracked != null) {

				for (var i = 0; i < aTracked.length; i++) {

					var link = aTracked[i];

					link.addEventListener('click', function(e){

						var target = e.currentTarget;
						var trackingLabel = target.dataset.trackinglabel;
						var trackingCategory = target.dataset.trackingcategory;

						ga("send", "event", trackingCategory, 'click', trackingLabel);

					}, false);

				}

			}

			if (socials != null) {

				for (var i = 0; i < socials.length; i++) {

					var social = socials[i];

					social.addEventListener('click', function(e){

						var className  = e.currentTarget.className;
						var service = className;

						switch(className) {
							case "gplus": service = "googleplus"; break;
						}

							ga("send", "event", "garden_robot", 'click', 'share_' + service);

					}, false);

				}

			}
	    }, 2000);

	};


	root.utils = {
		showTooltip : function() {
			var tElem = document.querySelector('.desktop-tooltip');

			if (tElem) {
				tElem.style.display = '';
			}
		},

		hideTooltip : function() {
			var tElem = document.querySelector('.desktop-tooltip');
			if (tElem) {
				tElem.style.display = 'none';
			}
		}
	};

	root.adjustCopy = function() {
		var el = document.querySelector('.desktop-tooltip'), msg, setText = function(
				d, m) {
			d.innerText = m;
			d.textContent = m;
		};

		if (el && (msg = el.querySelector('.message'))) {
			if (/DROUGHT/.test(msg.innerText + msg.textContent)) {
				if (root.controller.robotsGame.level === 3) {
					setText(
							msg,
							"This is tricky. Try varying the blocks that you have inside the REPEAT block. HINT: Try with four actions.");
				} else if (root.controller.robotsGame.level === 4) {
					setText(
							msg,
							"This is super tricky. Try putting the IF block inside the REPEAT block. HINT: Not everything needs to be repeated.");
				}
			}
		}
	};

	root.isMobile = function() {
		return window.document.body.getBoundingClientRect().width < 1010;
	};

	root.showTooltip = function(ops) {
		setTimeout(function() {

			var el = document.querySelector('.desktop-tooltip'), mobile = root
					.isMobile(), msg;

			if (!el) {
				el = document.querySelector('.desktop-tooltip-right');
			}

			if (mobile) {
				el = document.querySelector('.mobile-tooltip');
			}

			if (el) {
				el.classList.remove('hidden');

				if (ops.text !== undefined) {
					msg = el.querySelector('.message');
					msg.innerText = ops.text;
					msg.textContent = ops.text;
				}

				if (mobile) {
					return;
				}

				if (ops.left !== undefined) {
					el.style.left = ops.left + 'px';
				}

				if (ops.top !== undefined) {
					el.style.top = ops.top + 'px';
				}

				if (ops.elLeft !== undefined) {
					el.style.left = document.querySelector(ops.elLeft)
							.getBoundingClientRect().left
							- 400 + 'px';
				}

				if (ops.dir !== undefined) {
					el.className = 'desktop-tooltip-' + ops.dir;
				}
			}

		}, 0);
	};

	root.adjustPreviewSize = function() {

	};

	root.setHelpLink = function(num) {
		var el = document.querySelector('#help-link');
		el.href = "/project/robots#example-" + num;
	};

	root.onPreviewAvailable = function() {
		// root.previewElements = [];
		// window.addEventListener('resize', function(){
		// root.adjustPreviewSize();
		// // console.log('resize',
		// window.document.body.getBoundingClientRect());
		// });
	};

	root.setHashLevel = function(num) {
		root.hashLevel = num;
	};

	root.getHashLevel = function() {
		var hash = window.location.hash, num;

		if (!hash) {
			return;
		}

		num = hash.split("-")[1];

		if (!num) {
			return;
		}

		num = parseInt(num, 10);

		return window.isNaN(num) ? undefined : num;
	};

	(function() {
		var hash = root.getHashLevel();
		if (hash !== undefined) {
			root.setHashLevel(hash - 1);
		}

		// root.controller.robotsGame.robotBackground.reset();

	})();

})(Robots);
