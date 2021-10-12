import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
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


export class MusicSurfer extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
	    // constructor for frequency - Lawrence
        super();
        this.audio = new Audio('music2.mp3');
        //this.audio = document.getElementById("myAudio");
        this.audioCtx = new (window.AudioContext)();

        this.source = this.audioCtx.createMediaElementSource(this.audio);

        this.analyzer = this.audioCtx.createAnalyser();
        this.analyzer.fftSize = 512;

        this.source.connect(this.analyzer);
        this.source.connect(this.audioCtx.destination);
        this.analyzer.connect(this.audioCtx.destination);

        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
	
        // list of game constants
        // basic logic
        this.max_lane           = 2;
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

        //gravity constants 
        this.isfalling          = false;
        this.offset             = 0; //height the player drops from
        this.gravity            = .01; // every tick, the player's drop speed increases by this value
        this.initial_drop_speed = .1; // speed the player initially drops at 
        this.curr_drop_speed    = .05; // speed the player is dropping at, at the current tick

        // obstacle buffer
        this.obstacles          = new Array();

        // integer seconds
        this.seconds            = 0;
	
        // heights of each bin
        this.heights = new Array(this.num_bins);
        
        // camera location
        // player_height <= 2 * 10 = 20;
        this.camera_location    = vec3(-30, 30, 0);
        this.camera_point       = vec3(0, 12, 0);
        this.up_vec             = vec3(1, 0, 0);

        // light location 
        this.light_location = vec4(-40, 40, 0, 1);
        this.light_color = color(1,1,1,1); // white color

	// colors
	this.player_color   = hex_color("#fac91a");
	this.ground1_color  = hex_color("#0000A0");
	this.ground2_color  = hex_color("#87ceeb");
	this.obstacle_color = hex_color("#00FF00"); // not used, random number

	
        // shapes & materials
        this.shapes = {
            'box': new Cube(),
            'outline': new Cube_Outline(),
            'token': new Shape_From_File("assets/coin.obj"),
            'character': new Shape_From_File("assets/cartoon_boy.obj"),
	    'shark': new Shape_From_File("assets/chark.obj"),
        };
        const phong = new defs.Phong_Shader();
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
        };

        this.white = new Material(new defs.Basic_Shader());

        // initialization of the camera
        this.initial_camera_location = Mat4.look_at(this.camera_location, this.camera_point, this.up_vec);
        this.currlane = 0;
        this.player_height = this.init_player_cubes;
        this.prev_height = this.player_height;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements. - Lawrence
        this.key_triggered_button("Play/Pause Music", ["Control", "0"], () => {
	    this.audio_playing ^= 1;
	    if (this.audio_playing){
		this.audioCtx.resume();
		this.audio.play();
	    }
	    else{
		this.audioCtx.suspend();
		this.audio.pause();
	    }
	});
	    // player movement buttons

	    // button constructor
	    // key_triggered_button(description, shortcut_combination, callback, color = '#6E6460',
	    // recipient = this, parent = this.control_panel)
        

	    this.key_triggered_button("Move Left", ["A"], () => {this.move_left = true;}, '#6E6460', () => {
            this.move_left = false;}
	    )
	

        this.key_triggered_button("Move Right", ["D"], () => {this.move_right = true;}, '#6E6460', () => {
            this.move_right = false;}
	    )
    }

    frequency_to_height() {
        this.heights.fill(0);
        // first collect sum of all bins
        // ceiling can be derived
        //var ceiling = (this.bufferLength/this.num_bins)*255;
        let j = 0;
        for (let i = 30; i < 40; i+=2){
            var v = this.dataArray[i] / 255;
            var y = Math.exp(v**3);
            y = Math.max(y-1, 0);
            this.heights[j] += y;
            j += 1;
        }
        // for each bin, we linearly fit to height from 0 to 5

        for (let i = 0; i < this.num_bins; i ++){
            this.heights[i] = Math.round(this.heights[i]*5);
            this.heights[i] = this.heights[i] + 1;
        }

    }


    /*
    // note each byte is [0,255]
    frequency_to_height() {
        this.heights.fill(0);
        // first collect sum of all bins
        // ceiling can be derived
        var ceiling = (this.bufferLength/this.num_bins)*255;
        for (let i = 0; i < this.bufferLength; i ++){
            this.heights[i % this.num_bins] += this.dataArray[i];
        }
        // for each bin, we linearly fit to height from 0 to 5
        for (let i = 0; i < this.num_bins; i ++){
            this.heights[i] = Math.round(this.heights[i] / ceiling * this.max_barrier_cubes);
        }
    }

     */

    draw_obstacle(context, program_state, obstacle_transform, distance, heights, color, isBarrier) {

            obstacle_transform = obstacle_transform.times(
	            Mat4.translation(distance, 1.2, -this.lane_width * this.max_lane)
	        );

            //console.log(heights);

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

    
    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.lights = [new Light(this.light_location, this.light_color, 50000)];
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        let model_transform = Mat4.identity();

        // display the floor
        let floor_transform1 = model_transform.times(Mat4.scale(200, 0.1, 10, 0));
        this.shapes.box.draw(
            context,
            program_state,
            floor_transform1,
            this.materials.plastic.override(this.ground1_color)
        );
        let floor_transform2 = model_transform.times(Mat4.scale(200, 0.2, 5, 0));
        this.shapes.box.draw(
            context,
            program_state,
            floor_transform2,
            this.materials.plastic.override(this.ground2_color)
        );

        // display the side waves
        let wave1 = Mat4.identity();
        wave1 = wave1.times(Mat4.translation(-12, 0, 10));

        let wave2 = Mat4.identity();
        wave2 = wave2.times(Mat4.translation(-12, 0, -10));

        let j;
        for (j = 3; j < this.bufferLength; j++) {

            var v = this.dataArray[j] / 128.0;
            var y = v * 2;

            wave1 = wave1.times(Mat4.scale(1, y ** 2, 1));
            wave2 = wave2.times(Mat4.scale(1, y ** 2, 1));
            this.shapes.box.draw(context, program_state, wave1, this.materials.plastic.override(this.ground1_color));
            this.shapes.box.draw(context, program_state, wave2, this.materials.plastic.override(this.ground1_color));
            wave1 = wave1.times(Mat4.scale(1, 1 / (y ** 2), 1));
            wave1 = wave1.times(Mat4.translation(1, 0, 0));

            wave2 = wave2.times(Mat4.scale(1, 1 / (y ** 2), 1));
            wave2 = wave2.times(Mat4.translation(1, 0, 0));
        }


        //player movement + acceleration
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


        // display the player
        for (let i = 0; i < this.player_height; i++) {
            //first block starts at (0,1,z) we want the whole block be above the ground                     
            let T_player = model_transform.times(Mat4.translation(0, (this.cube_size * i + this.cube_size / 2 + 0.2), this.lane_width * this.currlane));

            //gravity rendering
            if (this.offset > 0.2) { //0.2 corresponding to this value => (this.cube_size * i + this.cube_size/2 + 0.2)
                T_player = T_player.times(Mat4.translation(0, this.offset, 0));
                this.offset -= this.curr_drop_speed; // every tick continue to fall by curr_drop_speed
                this.curr_drop_speed += this.gravity; // add to our current drop speed (simulates acceleration)
            } else {
                this.offset = 0; // reset the offset
                this.curr_drop_speed = this.initial_drop_speed; //reset the curr_drop_speed
            }


            this.shapes.box.draw(context, program_state, T_player, this.materials.plastic.override(this.player_color));
            this.shapes.outline.draw(context, program_state, T_player.times(Mat4.scale(1.01, 1.01, 1.01)), this.white, "LINES");

            if (i == this.player_height - 1) {
                T_player = T_player.times(Mat4.translation(0, this.cube_size + 1, 0));
                this.shapes.character.draw(context, program_state, T_player, this.materials.character.override(this.player_color));
            }

        }
        // gravity reset
        if (this.isfalling == false) { //if we aren't falling

            this.prev_height = this.player_height; //then continue to update the previous height 
        }

        // get real-time frequency data - lawrence
        // range (0,255)
        this.analyzer.getByteFrequencyData(this.dataArray);
        //console.log(this.dataArray);
        this.frequency_to_height();

        for (let i = -this.max_lane; i <= this.max_lane; i++) {
            // if exists height, then draw it
            for (let j = 0; j < this.heights[i + this.max_lane]; j++) {
                let T_barrier = model_transform.times(Mat4.translation(this.far_distance, this.cube_size * j + this.cube_size / 2, this.lane_width * i));
                this.shapes.box.draw(context, program_state, T_barrier, this.materials.plastic.override(this.ground1_color));
            }
        }

        //create obstacles every interval
        // only generate obstacles when the music is playing
        if (this.audio_playing && this.seconds != Math.floor(t)) {
            this.seconds = Math.floor(t);
            if (this.seconds % this.barrier_interval == 0) {
                // random color here
                var obstacle_color = Array(5).fill(0).map(x => color(Math.random(), Math.random(), Math.random(), 1));
                this.obstacles.push([this.far_distance, Array.from(this.heights), Array.from(obstacle_color), 1]);

                // add dynamic number of token generated after the obstacle
                // guarantees that the user doesn't get too many tokens but also not too few
                var min_height = Math.min(...this.heights); // find the optimal loss of height for the player
                var num_token = 0;
                // define four possible number of tokens allocated next
                num_token = Math.max(Math.floor(Math.random() * 4) + min_height - 1, 0);
                // we push the tokens into the obstacle array immediately
                // randomly calculate the token position
                for (let i = 0; i < num_token; i++) {
                    var dist = this.far_distance + this.movement_speed * 27 * (Math.random() * (this.barrier_interval - 1) + 0.5);
                    var token_positions = Array(5).fill(0);
                    token_positions[Math.floor(Math.random() * 5)] = 1;
                    this.obstacles.push([dist, Array.from(token_positions), Array.from(obstacle_color), 0])
                }

            } else if (this.seconds % this.shark_appear == 0) {
                var obstacle_color = Array(5).fill(0).map(x => color(Math.random(), Math.random(), Math.random(), 1));
                var shark_positions = Array(5).fill(0);
                shark_positions[Math.floor(Math.random() * 5)] = 1;
                this.obstacles.push([80, shark_positions, obstacle_color, 2]);
            }
            /*
        else if (this.seconds % this.init_token_interval == 0) {
                var obstacle_color = Array(5).fill(0).map(x => color(Math.random(), Math.random(), Math.random(), 1));
                var token_positions = Array(5).fill(0);
                token_positions[Math.floor(Math.random()*5)] = 1;
                this.obstacles.push([80, token_positions, obstacle_color, 0]);
            }
        */
        }

        // remove passed obstacles from the array
        if (this.obstacles.length != 0) {
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
}

