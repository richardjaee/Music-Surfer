import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
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


export class frequency extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
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

        /*
        setInterval(() => {
            this.analyzer.getByteFrequencyData(this.dataArray);
            console.log(this.dataArray);
        }, 1000);

         */

        this.shapes = {
            'box': new Cube(),
        };

        this.num_bins = 9;

        this.heights = new Array(this.num_bins);

        const phong = new defs.Phong_Shader();

        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)})
        };

        // At the beginning of our program, load one of each of these shape definitions onto the GPU
        this.initial_camera_location = Mat4.look_at(vec3(20, 10, 20), vec3(1, 0, 0), vec3(0, 1, 0));

    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Play Music", ["Control", "0"], () => {this.audioCtx.resume(); this.audio.play()});
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
            //this.heights[i] = Math.round(this.heights[i]*10);
            this.heights[i] = this.heights[i]*10;
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

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();

        this.analyzer.getByteFrequencyData(this.dataArray);
        //console.log(this.dataArray);


        let i;

        /*
        for (i = 30; i < 48; i += 2) {

            var v = this.dataArray[i] / 255;
            var y = Math.exp(v**3);
            y = Math.max(y-1, 0.01);
            y = y*10;
            console.log(y);

            model_transform = model_transform.times(Mat4.scale(1,y,1));
            this.shapes.box.draw(context, program_state, model_transform, this.materials.plastic.override(yellow));
            model_transform = model_transform.times(Mat4.scale(1,1/y,1));
            model_transform = model_transform.times(Mat4.translation(1,0,0));
        }

         */
        this.frequency_to_height();
        for (i = 0; i < this.num_bins; i++) {
            model_transform = model_transform.times(Mat4.scale(1,this.heights[i],1));
            this.shapes.box.draw(context, program_state, model_transform, this.materials.plastic.override(yellow));
            model_transform = model_transform.times(Mat4.scale(1,1/this.heights[i],1));
            model_transform = model_transform.times(Mat4.translation(1,0,0));
        }


    }
}

