import {defs, tiny} from './examples/common.js';
// Pull these names into this module's scope for convenience:
const {vec3, Vector3, vec4, vec, color, hex_color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Shape_From_File} from './examples/obj-file-demo.js'
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './examples/shadow-demo-shaders.js'
import {Text_Line} from "./examples/text-demo.js";


// 2D shape, to display the texture buffer
const Square =
    class Square extends tiny.Vertex_Buffer {
        constructor() {
            super("position", "normal", "texture_coord");
            this.arrays.position = [
                vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0),
                vec3(1, 1, 0), vec3(1, 0, 0), vec3(0, 1, 0)
            ];
            this.arrays.normal = [
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
            ];
            this.arrays.texture_coord = [
                vec(0, 0), vec(1, 0), vec(0, 1),
                vec(1, 1), vec(1, 0), vec(0, 1)
            ]
        }
    }

class Minimal_Cylinder extends tiny.Vertex_Buffer {
    // **Minimal_Shape** an even more minimal triangle, with three
    // vertices each holding a 3D position and a color.
    constructor() {
        super("position", "color");
        // Describe the where the points of a triangle are in space, and also describe their colors:
        this.arrays.position;
        this.arrays.color;

        let i;
        for (i = 0; i < 100; i++) {
            let angle1 = 2*Math.PI*i/100;
            let angle2 = 2*Math.PI*(i+1)/100;
            this.arrays.position.push(vec3(Math.cos(angle1), Math.sin(angle1), 0));
            this.arrays.position.push(vec3(Math.cos(angle1), Math.sin(angle1), 1));
            this.arrays.position.push(vec3(Math.cos(angle2), Math.sin(angle2), 0));

            this.arrays.position.push(vec3(Math.cos(angle2), Math.sin(angle2), 1));
            this.arrays.position.push(vec3(Math.cos(angle1), Math.sin(angle1), 1));
            this.arrays.position.push(vec3(Math.cos(angle2), Math.sin(angle2), 0));

            this.arrays.color.push(color(0, 0, 1, 1));
            this.arrays.color.push(color(0, 0, 1, 0.25));
            this.arrays.color.push(color(0, 0, 1, 1));
            this.arrays.color.push(color(0, 0, 1, 0.25));
            this.arrays.color.push(color(0, 0, 1, 0.25));
            this.arrays.color.push(color(0, 0, 1, 1));
        }
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1,-1,-1], [-1,-1,1], [-1,-1,-1], [-1,1,-1], [-1,-1,-1], [1,-1,-1], [-1,-1,1], [-1,1,1],
            [-1,-1,1], [1,-1,1], [-1,1,-1], [-1,1,1], [-1,1,1], [1,1,1], [1,-1,-1], [1,1,-1],
            [1,-1,1], [1,-1,-1], [1,-1,1], [1,1,1], [1,1,-1], [-1,1,-1], [1,1,1], [1,1,-1]);

        this.arrays.color = Vector3.cast(
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1]);

        this.indices = false;
    }
}

class Cube2_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1,-1,-1], [-1,-1,1], [-1,-1,-1], [-1,1,-1], [-1,-1,-1], [1,-1,-1], [-1,-1,1], [-1,1,1],
            [-1,-1,1], [1,-1,1], [-1,1,-1], [-1,1,1], [-1,1,1], [1,1,1], [1,-1,-1], [1,1,-1],
            [1,-1,1], [1,-1,-1], [1,-1,1], [1,1,1], [1,1,-1], [-1,1,-1], [1,1,1], [1,1,-1]);

        this.arrays.color;
        let i;
        for (i = 0; i < 24; i++) {
            this.arrays.color.push(color(0,0,0,1));
        }

        this.indices = false;
    }
}


// The scene
export class Shadow_Music_Surfer extends Scene {
    constructor() {
        super();
        // Load the model file:
        this.shapes = {
            "teapot": new Shape_From_File("assets/teapot.obj"),
            "sphere": new Subdivision_Sphere(6),
            "cube": new Cube(),
            "square_2d": new Square(),
            "box": new Cube(),
            'outline': new Cube_Outline(),
            "tunnel": new Minimal_Cylinder(),
            "character": new Shape_From_File("assets/cartoon_boy.obj"),
            "shark": new Shape_From_File("assets/chark.obj"),
            "text": new Text_Line(35),
            "token": new Shape_From_File("assets/coin.obj"),
            "outline2": new Cube2_Outline(),
        };

        const phong = new defs.Phong_Shader();
        const texture = new defs.Textured_Phong(1);

        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)}),
            token: new Material(phong,
                {ambient: .8, diffusivity: .8, specularity: .8, color: color(1, .9, 0, 1), texture: new Texture("assets/Coin_Gold_albedo.png")}),
            character: new Material(phong,
                {ambient: 1, diffusivity: 1, specularity: 1, color: color(0, .5, 0, 1)}),
            shark: new Material(new defs.Textured_Phong(),
                {color: hex_color("#808080"),
                    ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                    texture: new Texture("assets/shark0021200pxfoto10.png", "NEAREST")}),
            text: new Text_Line(35),
        };

        this.text_image = new Material(texture, {
            ambient: 1, diffusivity: 0, specularity: 0,
            texture: new Texture("assets/text.png")
        });


        // For the teapot
        this.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.5, .5, .5, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/stars.png"),
            light_depth_texture: null

        });
        // For the floor or other plain objects
        this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(1, 1, 1, 1), ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        })
        // For the first pass
        this.pure = new Material(new Color_Phong_Shader(), {
        })

        // To make sure texture initialization only does once
        this.init_ok = false;

        // light location
        this.light_location = vec4(-40, 40, 0, 1);
        this.light_color = color(1,1,1,1); // white color

        //AUDIO
        this.audio = new Audio('music2.mp3');
        //this.audio = document.getElementById("myAudio");
        this.audioCtx = new (window.AudioContext)();

        this.source = this.audioCtx.createMediaElementSource(this.audio);

        this.analyzer = this.audioCtx.createAnalyser();
        this.analyzer.fftSize = 1024;

        this.source.connect(this.analyzer);
        this.source.connect(this.audioCtx.destination);
        this.analyzer.connect(this.audioCtx.destination);

        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        //CAMERA
        this.camera_location    = vec3(-30, 30, 0);
        this.camera_point       = vec3(8, 12, 0);
        this.up_vec             = vec3(10, 0, 0);
        this.initial_camera_location = Mat4.look_at(this.camera_location, this.camera_point, this.up_vec);

        this.intro_camera_location  = vec3(-100, 100, 0);
        this.intro_camera_point     = vec3(0, 99, 0);
        this.intro_up_vec           = vec3(10, 0, 0);

        this.intro_camera = Mat4.look_at(this.intro_camera_location, this.intro_camera_point, this.intro_up_vec);

        // colors
        this.player_color   = hex_color("#fac91a");
        this.ground1_color  = hex_color("#0000A0");
        this.ground2_color  = hex_color("#87ceeb");
        this.obstacle_color = hex_color("#00FF00"); // not used, random number
        this.white = new Material(new defs.Basic_Shader());


        //CONSTANTS
        // list of game constants
        // basic logic
        this.max_lane           = 5;
        this.num_bins           = this.max_lane * 2 + 1;
        this.lane_width         = 2; // same as the size of the cube
        this.cube_size          = 2;
        this.init_player_cubes  = 5; // initial number of cubes by player
        this.max_player_cubes   = 10; // maximal height of the player
        this.max_barrier_cubes  = 5; // ceiling of number of barriers

        this.movement_speed     = 0.3; // 1.5 cube size per second
        this.barrier_interval   = 6; // barrier movement
        this.init_token_interval= 3; // token movement
        this.init_shark_appear  = 3; // shark appearance
        this.shark_appear       = this.init_shark_appear;
        this.token_interval     = this.init_token_interval;
        this.barrier_remove_dis = -12;
        this.token_remove_dis   = -1;
        this.player_switch_acc  = 1; // continuous switch acceleration

        this.audio_playing      = 0; // if the audio is playing or not

        this.far_distance       = 90;
        // movement constants
        this.move_left          = false;
        this.move_right         = false;
        this.initial_speed      = 0.0;   // speed the player starts at
        this.curr_speed         = 0.0;   // speed the player is moving at, at the current tick
        this.acceleration       = 0.01; // every tick, the player accelerates by this value

        //more
        this.currlane = 0;
        this.player_height = this.init_player_cubes;
        this.prev_height = this.player_height;

        //swaying constants
        this.curr_angle         = 0.0; // curent angle of tilt
        this.tilt_angle         = .05*Math.PI; // max angle of tilt
        this.tilt_angle_speed   = 0.008; // speed of tilt
        this.tilt_angle_init    = 0.0; // initial angle
        this.tilt_right         = false;
        this.tilt_left          = false;

        //gravity constants
        this.isfalling          = false;
        this.offset             = 0; // height the player drops from
        this.gravity            = .01; // every tick, the player's drop speed increases by this value
        this.initial_drop_speed = .1; // speed the player initially drops at
        this.curr_drop_speed    = .05; // speed the player is dropping at, at the current tick

        // obstacle buffer
        this.obstacles          = new Array();

        // integer seconds
        this.seconds            = 0;

        //detect song begin
        this.game_begin = 0;
        this.game_begin_time = 9999;
        this.begin_time_set = 0;
        this.maxTime = 2;


        // detect song over
        this.song_over = 0;

        // heights of each bin
        this.heights = new Array(this.num_bins);

        //song length
        //194 for music2.mp3
        this.song_length = 194;







    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements. - Lawrence
        this.key_triggered_button("Play/Pause Music", ["Control", "0"], () => {
            this.audio_playing ^= 1;
            if (this.audio_playing) {
                this.audioCtx.resume();
                this.audio.play();
                this.game_begin = 1;
            } else {
                this.audioCtx.suspend();
                this.audio.pause();
            }
        });

        this.key_triggered_button("Move Left", ["A"], () => {this.move_left = true;}, '#6E6460', () => {
            this.move_left = false;}
        )


        this.key_triggered_button("Move Right", ["D"], () => {this.move_right = true;}, '#6E6460', () => {
            this.move_right = false;}
        )
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.stars.light_depth_texture = this.light_depth_texture
        this.floor.light_depth_texture = this.light_depth_texture

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow

        let light_position = this.light_position;
        let light_color = this.light_color;
        const t = program_state.animation_time;

        program_state.draw_shadow = draw_shadow;

        let model_transform = Mat4.identity();
        let floor_transform1 = model_transform.times(Mat4.scale(this.far_distance, 0.1, 22, 0));
        this.shapes.box.draw(
            context,
            program_state,
            floor_transform1,
            shadow_pass? this.floor.override({color: this.ground1_color}) : this.pure
        );
        let floor_transform2 = model_transform.times(Mat4.scale(this.far_distance, 0.2, 11, 0));
        this.shapes.box.draw(
            context,
            program_state,
            floor_transform2,
            shadow_pass? this.floor.override({color: this.ground2_color}) : this.pure
        );

        // ----------------------------display the player----------------------------

        let T_player = model_transform; //needed for sway to work correctly
        //this.shapes.box.draw(context, program_state, T_player, shadow_pass? this.floor.override({color: this.player_color}) : this.pure);
        for (let i = 0; i < this.player_height; i++) {
            //first block starts at (0,1,z) we want the whole block be above the ground
            //let T_player = model_transform.times(Mat4.translation(0, (this.cube_size * i + this.cube_size / 2 + 0.2), this.lane_width * this.currlane));

            //swaying motion
            if (i == 0) //render the first block separately
            {
                T_player = model_transform.times(Mat4.translation(0, (this.cube_size * i + this.cube_size / 2 + 0.2) ,this.lane_width*this.currlane));
            }
            else if (this.move_right ^ this.move_left) //either button held down but not both
            {
                if (this.move_right) //right button clicked
                {

                    if (this.curr_angle > this.tilt_angle) //if we are tilting past the desired angle
                    {
                        this.curr_angle = this.tilt_angle; //set our current angle to the max angle
                    }
                    //handles rotation on a hinge
                    T_player = T_player.times(Mat4.translation(0, this.cube_size  ,0));
                    T_player = T_player.times(Mat4.translation( 0 , -1 , 1));
                    T_player = T_player.times(Mat4.rotation(this.curr_angle  , 1 , 0 , 0 ));
                    T_player = T_player.times(Mat4.translation( 0 , 1 , -1));

                    this.curr_angle += this.tilt_angle_speed; //add to our current angle
                    this.tilt_right = true;
                }
                else if (this.move_left)  //left button clicked
                {

                    if (this.curr_angle > this.tilt_angle)
                    {
                        this.curr_angle = this.tilt_angle;
                    }

                    T_player = T_player.times(Mat4.translation(0, this.cube_size  ,0));
                    T_player = T_player.times(Mat4.translation( 1 , -1 , -1));
                    T_player = T_player.times(Mat4.rotation(this.curr_angle , -1 , 0 , 0 ));
                    T_player = T_player.times(Mat4.translation( -1 , 1 , 1));

                    this.curr_angle += this.tilt_angle_speed;
                    this.tilt_left = true;

                }


            }
            else //neither button held down
            {
                if (this.tilt_right) //still at an angle, no button held down
                {
                    if (this.curr_angle < 0) //if we have reached the normal position
                    {
                        this.tilt_right = false; //reset to false
                        this.curr_angle = 0; //reset curr_angle
                    }
                    //handles rotation on a hinge
                    T_player = T_player.times(Mat4.translation(0, this.cube_size  ,0));
                    T_player = T_player.times(Mat4.translation( 0 , -1 , 1));
                    T_player = T_player.times(Mat4.rotation(this.curr_angle  , 1 , 0 , 0 ));
                    T_player = T_player.times(Mat4.translation( 0 , 1 , -1));

                    this.curr_angle -= this.tilt_angle_speed; //subtract from the current angle (reset back to starting position)
                }
                else if (this.tilt_left) //still at an angle, no button held down
                {
                    if (this.curr_angle < 0) //if we have reached the normal position
                    {
                        this.tilt_left = false; //reset to false
                        this.curr_angle = 0; //reset curr_angle
                    }
                    //handles rotation on a hinge
                    T_player = T_player.times(Mat4.translation(0, this.cube_size  ,0));
                    T_player = T_player.times(Mat4.translation( 1 , -1 , -1));
                    T_player = T_player.times(Mat4.rotation(this.curr_angle , -1 , 0 , 0 ));
                    T_player = T_player.times(Mat4.translation( -1 , 1 , 1));

                    this.curr_angle -= this.tilt_angle_speed; //subtract from the current angle (reset back to starting position)
                }
                else //reach here when neither button held down and aren't currently tilting
                {
                    T_player = model_transform.times(Mat4.translation(0, (this.cube_size * i + this.cube_size / 2 + 0.2) ,this.lane_width * this.currlane));
                    this.curr_angle = this.tilt_angle_init; //reset curr_angle
                }



            }
            //gravity rendering
            if (this.offset > 0.2) { //0.2 corresponding to this value => (this.cube_size * i + this.cube_size/2 + 0.2)
                T_player = T_player.times(Mat4.translation(0, this.offset, 0));
                this.offset -= this.curr_drop_speed; // every tick continue to fall by curr_drop_speed
                this.curr_drop_speed += this.gravity; // add to our current drop speed (simulates acceleration)
            } else {
                this.offset = 0; // reset the offset
                this.curr_drop_speed = this.initial_drop_speed; //reset the curr_drop_speed
            }

            this.shapes.box.draw(context, program_state, T_player, shadow_pass? this.floor.override({color: this.player_color}) : this.pure);
            this.shapes.outline.draw(context, program_state, T_player.times(Mat4.scale(1.01, 1.01, 1.01)), shadow_pass? this.white : this.pure, "LINES");

            if (i == this.player_height - 1) {
                T_player = T_player.times(Mat4.translation(0, this.cube_size + 1, 0));
                this.shapes.character.draw(context, program_state, T_player, shadow_pass? this.materials.character.override(this.player_color): this.pure);
            }

        }
        // gravity reset
        if (this.isfalling == false) { //if we aren't falling

            this.prev_height = this.player_height; //then continue to update the previous height
        }

        //--------------------------------------------------------------------------------



        /*
        let model_trans_floor = Mat4.scale(8, 0.1, 5);
        let model_trans_ball_0 = Mat4.translation(0, 1, 0);
        let model_trans_ball_1 = Mat4.translation(5, 1, 0);
        let model_trans_ball_2 = Mat4.translation(-5, 1, 0);
        let model_trans_ball_3 = Mat4.translation(0, 1, 3);
        let model_trans_ball_4 = Mat4.translation(0, 1, -3);
        this.shapes.cube.draw(context, program_state, model_trans_floor, shadow_pass? this.floor.override({color: color(0,0,1,1)}) : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ball_0, shadow_pass? this.floor : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ball_1, shadow_pass? this.floor : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ball_2, shadow_pass? this.floor : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ball_3, shadow_pass? this.floor : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ball_4, shadow_pass? this.floor : this.pure);

         */
    }

    display(context, program_state) {
        //console.log(this.game_begin);
        this.audio.addEventListener("ended", function()
        {
            this.song_over = 1;
        });

        if (this.game_begin == 0) {
            this.display_text(context, program_state, 1);
        }
        else {
            let seconds = program_state.animation_time/1000;
            if (seconds > this.game_begin_time + this.song_length + 3) {
                this.song_over = 1;
            }

            if (this.song_over == 0) {
                this.display_play(context, program_state);
            } else {
                this.display_text(context, program_state, 0);
            }
        }
    }

    display_text(context, program_state, start) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            //program_state.set_camera(this.initial_camera_location);
            //program_state.set_camera(this.intro_camera);
        }
        program_state.set_camera(this.intro_camera);
        program_state.lights = [new Light(this.light_location, this.light_color, 50000)];
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        let model_transform = Mat4.identity();
        let cube_transform = Mat4.identity();

        cube_transform = cube_transform.times(Mat4.translation(0, 100, 0));
        cube_transform = cube_transform.times(Mat4.translation(-40, -10, 0));
        cube_transform = cube_transform.times(Mat4.scale(20,20,20));
        cube_transform = cube_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0));

        let strings;
        if (start == 1) {
            strings = ["MUSIC SURFER\n\n\nTutorial: \n\n-Press 'Play Music' to begin\n\n-Use (A) and (D) to hop \nover obstacles and collect \nyellow energy tokens\n\n-Obstacles reduce the player's \nheight \n\n-AVOID SHARKS AT ALL COSTS\n\n(Use CAPS LOCK!)"];
        } else {
            strings = ["MUSIC SURFER\n\n\nYOU WIN :) \n\n"];
        }

        this.draw_text(cube_transform, strings[0], context, program_state);
    }

    display_play(context, program_state) {

        if (this.begin_time_set == 0) {
            this.game_begin_time = program_state.animation_time/1000;
            this.begin_time_set = 1;
        }

        let time_elapsed = program_state.animation_time/1000 - this.game_begin_time;
        if (time_elapsed < this.maxTime) {
            let temp_camera = this.camera_transition(time_elapsed, this.maxTime);
            program_state.set_camera(temp_camera);
        } else {
            program_state.set_camera(this.initial_camera_location);
        }

        const t = program_state.animation_time / 1000;
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        // The position of the light
        this.light_position = Mat4.rotation(0 / 1500, 0, 1, 0).times(vec4(-10, 50, 10, 1));
        // The color of the light
        this.light_color = color(
            1, 1, 1, 1
        );

        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(100, 0, 0, 1);
        this.light_field_of_view = 130 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 10000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Prepare uniforms
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, false, false, false);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, true, true, true);

        //------------------------------------INTRO TEXT-----------------------------------------------------
        let cube_transform = Mat4.identity();

        cube_transform = cube_transform.times(Mat4.translation(0, 100, 0));
        cube_transform = cube_transform.times(Mat4.translation(-40, -10, 0));
        cube_transform = cube_transform.times(Mat4.scale(20,20,20));
        cube_transform = cube_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0));

        let strings = ["MUSIC SURFER\n\n\nTutorial: \n\n-Press 'Play Music' to begin\n\n-Use (A) and (D) to hop \nover obstacles and collect \nyellow energy tokens\n\n-Obstacles reduce the player's \nheight \n\n-AVOID SHARKS AT ALL COSTS\n\n(Use CAPS LOCK!)"];

        this.draw_text(cube_transform, strings[0], context, program_state);


        //-----------------------------------TUNNEL LOGIC------------------------------------------------------
        let model_transform = Mat4.identity();

        let tunnel_transform = Mat4.identity();
        tunnel_transform = tunnel_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
        tunnel_transform = tunnel_transform.times(Mat4.scale(this.far_distance / 2, this.far_distance / 2, this.far_distance * 2, 0));

        const random = (x) => Math.abs(Math.sin(1000 * x + program_state.animation_time / 1000));

        const freq_scale = (x) => this.dataArray[x] / 255;
        this.shapes.tunnel.arrays.color.forEach((c, i, a) =>
            a[i] = vec4(freq_scale(i % 512), random(i), c[2], c[3])
        )
        this.shapes.tunnel.draw(context, program_state, tunnel_transform, this.white);
        this.shapes.tunnel.copy_onto_graphics_card(context.context, ["color"], false);

        // ------------------------------------------------------------------------------------
        // ----------------------------get real-time frequency data----------------------------
        // ------------------------------------------------------------------------------------
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.frequency_to_height();
        for (let i = -this.max_lane; i <= this.max_lane; i++) {
            // if exists height, then draw it
            for (let j = 0; j < this.heights[i + this.max_lane]; j++) {
                let T_barrier = model_transform.times(Mat4.translation(this.far_distance, this.cube_size * j + this.cube_size / 2, this.lane_width * i));
                this.shapes.box.draw(context, program_state, T_barrier, this.materials.plastic.override(this.ground2_color));
                this.shapes.outline2.draw(context,
                    program_state,
                    T_barrier.times(Mat4.scale(1.01,1.01,1.01)),
                    this.white, "LINES");
            }
        }

        // ------------------------------------------------------------------------------------
        // ----------------------------player movement-----------------------------------------
        // ------------------------------------------------------------------------------------

        if (this.move_left ^ this.move_right) //if either button is held down but not both
        {
            if (this.move_left) {
                if (this.currlane > -this.max_lane) {
                    if (this.currlane - (this.curr_speed) < -this.max_lane) // checks if increasing our speed will take us past the lane bounds
                    {
                        this.currlane = -this.max_lane;
                        this.curr_speed = this.initial_speed; // reset curr_speed
                    } else {
                        this.currlane -= this.curr_speed;
                        this.curr_speed += this.acceleration; // add to our current speed (simulates acceleration)
                    }
                }
            } else if (this.move_right) {
                if (this.currlane < this.max_lane) {
                    if (this.currlane + (this.curr_speed) > this.max_lane) // checks if increasing our speed will take us past the lane bounds
                    {
                        this.currlane = this.max_lane;
                        this.curr_speed = this.initial_speed; // reset curr_speed
                    } else {
                        this.currlane += this.curr_speed;
                        this.curr_speed += this.acceleration; // add to our current speed (simulates acceleration)
                    }
                }
            }

        } else
            this.curr_speed = this.initial_speed; // reset curr_speed


        // gravity falling helper
        if (this.isfalling) { // we have a collision
            // calculates the height of the barrier we collided with
            let h = this.prev_height - this.player_height;
            this.offset = (this.cube_size + this.cube_size / 2) * h;
            this.isfalling = false; // reset this variable to false
        }

        //-------------------------------------------------------------------------------------------------
        //-----------------------------------OBSTACLES------------------------------------------------------
        //-------------------------------------------------------------------------------------------------

        // ---------------------------------OBSTACLE-----------------------------------------------
        if (this.audio_playing && this.seconds != Math.floor(t)) {
            this.seconds = Math.floor(t);
            if (this.seconds % this.barrier_interval == 0) {
                // random color here
                var obstacle_color = Array(this.num_bins).fill(0).map(x => color(Math.random(), Math.random(), Math.random(), 1));
                this.obstacles.push([this.far_distance, Array.from(this.heights), Array.from(obstacle_color), 1]);

                // add dynamic number of token generated after the obstacle
                // guarantees that the user doesn't get too many tokens but also not too few
                var min_height = Math.min(...this.heights); // find the optimal loss of height for the player
                var num_token = min_height + 3;
                // define four possible number of tokens allocated next
                //num_token = Math.max(Math.floor(Math.random() * 4) + min_height - 1, 0);
                // we push the tokens into the obstacle array immediately
                // randomly calculate the token position
                for (let i = 0; i < num_token; i++) {
                    var dist = this.far_distance + this.movement_speed * 27 * (Math.random() * (this.barrier_interval - 1) + 0.5);
                    var token_positions = Array(this.num_bins).fill(0);
                    token_positions[Math.floor(Math.random() * this.num_bins)] = 1;
                    this.obstacles.push([dist, Array.from(token_positions), Array.from(obstacle_color), 0])
                }
            } else if (this.seconds % this.shark_appear == 0) {
                var obstacle_color = Array(this.num_bins).fill(0).map(x => color(Math.random(), Math.random(), Math.random(), 1));
                var shark_positions = Array(this.num_bins).fill(0);
                shark_positions[Math.floor(Math.random() * this.num_bins)] = 1;
                this.obstacles.push([80, shark_positions, obstacle_color, 2]);
            }
        }

        // remove passed obstacles from the array
        if (this.obstacles.length !== 0) {
            var pos = 0;
            while (pos < this.obstacles.length) {
                if ((this.obstacles[pos][3] > 0 && this.obstacles[pos][0] < this.barrier_remove_dis) ||
                    (this.obstacles[pos][3] == 0 && this.obstacles[pos][0] < this.token_remove_dis)) {
                    this.obstacles.splice(pos, 1);
                } else
                    pos++;
            }
        }

        // display the obstacles
        let obstacle_transform = model_transform;
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i][0] < this.far_distance)
                this.draw_obstacle(context, program_state, obstacle_transform, this.obstacles[i][0], this.obstacles[i][1], this.obstacles[i][2], this.obstacles[i][3]);
            // collision detection here
            // 0: token, 1: obstacle, 2: shark
            if (this.obstacles[i][3] == 1) {
                if ((this.obstacles[i][0] <= 0) && (this.obstacles[i][0] > -this.movement_speed)) {

                    let temp_lane = Math.round(this.currlane);

                    this.player_height -= this.obstacles[i][1][temp_lane + this.max_lane];
                    this.isfalling = true;

                }
                // if the player height is negative, quit
                if (this.player_height <= 0) {
                    let text_transform = model_transform;
                    text_transform = text_transform.times(Mat4.translation(20, 2, 13));
                    text_transform = text_transform.times(Mat4.scale(20, 20, 20));
                    text_transform = text_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
                    this.draw_text(text_transform, "CRUSHED BY TOWER\n\nGAME OVER :(", context, program_state);
                    this.audioCtx.suspend();
                    this.audio.pause();
                    return;
                }
            } else if (this.obstacles[i][3] == 0) {
                if ((this.obstacles[i][0] <= 0) && (this.obstacles[i][0] > -this.movement_speed) && (this.player_height <= this.max_player_cubes)) {

                    let temp_lane = Math.round(this.currlane);

                    this.player_height += this.obstacles[i][1][temp_lane + this.max_lane];
                }
            }

            // game end if the the player got eaten by a shark
            else if (this.obstacles[i][3] == 2) {
                if ((this.obstacles[i][0] <= 0) && (this.obstacles[i][0] > -this.movement_speed)) {
                    let temp_lane = Math.round(this.currlane);
                    if (this.obstacles[i][1][temp_lane + this.max_lane] == 1) {

                        let text_transform = model_transform;
                        text_transform = text_transform.times(Mat4.translation(20, 2, 13));
                        text_transform = text_transform.times(Mat4.scale(20, 20, 20));
                        text_transform = text_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));

                        this.draw_text(text_transform, "EATEN BY SHARK\n\nGAME OVER :(", context, program_state);
                        this.audioCtx.suspend();
                        this.audio.pause();
                        return;
                    }
                }
            }

            // only move the obstacles when the music is playing
            if (this.audio_playing)
                this.obstacles[i][0] -= this.movement_speed;
        }
    }

    //---------------------------------------------------------------------------------------------------------
    //----------------------------AUXILIARY FUNCTIONS----------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------

    draw_text(object_transform, text, context, program_state) {
        let i = 2;
        let j = 1;

        let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
            .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
            .times(Mat4.translation(-.9, .9, 1.01));

        const multi_line_string = text.split('\n');
        // Draw a Text_String for every line in our string, up to 30 lines:
        for (let line of multi_line_string.slice(0, 30)) {             // Assign the string to Text_String, and then draw it.
            this.shapes.text.set_string(line, context.context);
            this.shapes.text.draw(context, program_state, object_transform.times(cube_side)
                .times(Mat4.scale(.03, .03, .03)), this.text_image);
            // Move our basis down a line.
            cube_side.post_multiply(Mat4.translation(0, -.06, 0));
        }
    }

    frequency_to_height() {
        this.heights.fill(0);
        // first collect sum of all bins
        // ceiling can be derived
        //var ceiling = (this.bufferLength/this.num_bins)*255;
        let j = 0;

        for (let i = 30; i < 52; i+=2){
            var v = this.dataArray[i] / 255;
            //NEEDED TO ADD VARIANCE
            var y = Math.exp(v**3);
            y = Math.max(y-1, 0.01);
            this.heights[j] += y;
            j += 1;
        }
        // for each bin, we linearly fit to height from 0 to 5

        for (let i = 0; i < this.num_bins; i ++) {
            this.heights[i] = Math.round(this.heights[i] * 8);
            //this.heights[i] = this.heights[i] + 1;
        }


    }

    draw_obstacle(context, program_state, obstacle_transform, distance, heights, color, isBarrier) {

        obstacle_transform = obstacle_transform.times(
            Mat4.translation(distance, 1.2, -this.lane_width * this.max_lane)
        );

        for (let i = 0; i < this.num_bins; i++) {
            for (let h = 0; h < heights[i]; h++) {
                if (isBarrier == 1) {

                    this.shapes.box.draw(
                        context,
                        program_state,
                        obstacle_transform,
                        this.materials.plastic.override(color[i])
                    );
                    this.shapes.outline.draw(context,
                        program_state,
                        obstacle_transform.times(Mat4.scale(1.01,1.01,1.01)),
                        this.white, "LINES");
                }
                else if (isBarrier == 0) {
                    obstacle_transform = obstacle_transform.times(
                        Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.scale(0.7,0.7,0.7)).times(Mat4.translation(0,0.3,0));
                    this.shapes.token.draw(
                        context,
                        program_state,
                        obstacle_transform,
                        this.materials.token
                    )
                    obstacle_transform = obstacle_transform.times(
                        Mat4.translation(0,-0.3,0)
                    ).times(
                        Mat4.rotation(-Math.PI/2, 1, 0, 0)
                    );
                }

                else if (isBarrier == 2){
                    obstacle_transform = obstacle_transform.times(
                        Mat4.rotation(0, 0, Math.PI/2, 0)).times(Mat4.scale(0.7,0.7,0.7)).times(Mat4.translation(0,0,0));
                    this.shapes.shark.draw(
                        context,
                        program_state,
                        obstacle_transform,
                        this.materials.shark
                    )
                    obstacle_transform = obstacle_transform.times(
                        Mat4.translation(0,-0.3,0)).times(
                        Mat4.rotation(-Math.PI/2, 1, 0, 0)
                    );
                }

                obstacle_transform = obstacle_transform.times(Mat4.translation(0, this.cube_size, 0));
            }
            obstacle_transform = obstacle_transform.times(Mat4.translation(0, -1*heights[i] * this.cube_size, this.lane_width));
        }
    }

    camera_transition(time, maxTime) {

        //console.log(time);
        /*
        this.initial_camera_location = Mat4.look_at(this.camera_location, this.camera_point, this.up_vec);
        this.intro_camera = Mat4.look_at(this.intro_camera_location, this.intro_camera_point, this.intro_up_vec);
         */

        let temp_camera_location_x = this.intro_camera_location[0] + time/maxTime*(this.camera_location[0] - this.intro_camera_location[0]);
        let temp_camera_location_y = this.intro_camera_location[1] + time/maxTime*(this.camera_location[1] - this.intro_camera_location[1]);
        let temp_camera_location_z = this.intro_camera_location[2] + time/maxTime*(this.camera_location[2] - this.intro_camera_location[2]);

        let temp_camera_point_x = this.intro_camera_point[0] + time/maxTime*(this.camera_point[0]-this.intro_camera_point[0]);
        let temp_camera_point_y = this.intro_camera_point[1] + time/maxTime*(this.camera_point[1]-this.intro_camera_point[1]);
        let temp_camera_point_z = this.intro_camera_point[2] + time/maxTime*(this.camera_point[2]-this.intro_camera_point[2]);

        let temp_camera_location = vec3(temp_camera_location_x, temp_camera_location_y, temp_camera_location_z);
        let temp_camera_point = vec3(temp_camera_point_x, temp_camera_point_y, temp_camera_point_z);

        //console.log(temp_camera_location);
        //console.log(temp_camera_point);


        return Mat4.look_at(temp_camera_location, temp_camera_point, this.up_vec);


    }
}

