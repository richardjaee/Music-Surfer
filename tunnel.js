import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


class Cylinder_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex

        //specifies edges
        this.arrays.position = Vector3.cast(
            [0, 1, -1], [-1, 0, -1],
            [-1, 0, -1], [0, -1, -1],
            [0, -1, -1], [1, 0, -1],
            [1, 0, -1], [0, 1, -1],
            [0, 1, -1], [0, 1, 1],
            [-1, 0, -1], [-1, 0, 1],
            [0, -1, -1], [0, -1, 1],
            [1, 0, -1], [1, 0, 1],
            [0, 1, 1], [-1, 0, 1],
            [-1, 0, 1], [0, -1, 1],
            [0, -1, 1], [1, 0, 1],
            [1, 0, 1], [0, 1, 1]);

        //used to just use [1,1,1,1], changed to match TA
        let white = color(1.0,1.0,1.0,1.0)
        this.arrays.color = [
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white,
            white, white
        ];

        this.indices = false;
    }
}

class Cube_Single_Strip extends Shape {

    //step 6
    constructor() {
        super("position", "normal", "color");

        //list of vertices
        this.arrays.position = Vector3.cast(
            [-1, 1,  1], [ 1, 1,  1], //back top
            [-1,  -1,  1], [1,  -1,  1], //back bottom
            [-1, 1, -1], [ 1, 1, -1], //front top
            [-1,  -1, -1], [1,  -1, -1] //front bottom
        );

        this.arrays.normal = this.arrays.position;

        this.color = Vector3.cast(
            color(1,1,1,1), color(1,1,1,1), //back top
            color(1,1,1,1), color(1,1,1,1), //back bottom
            color(1,1,1,1), color(1,1,1,1), //front top
            color(1,1,1,1), color(1,1,1,1) //front bottom
        );

        this.indices.push(
            0, 1, 2, 3, 7, 1, 5, 0, 4, 2, 6, 7, 4, 5, //12 triangles
        );

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


        /*
        let i;
        for (i = 0; i < 3; i++) {
            if (i == 0) {
                this.arrays.position.push(vec3(0, 1, 0));
            } else if (i == 1) {
                this.arrays.position.push(vec3(0, 1, 1));
            } else {
                this.arrays.position.push(vec3(1, 1, 0));
            }
        }

        for (i = 0; i < 3; i++) {
            if (i == 0) {
                this.arrays.position.push(vec3(1, 1, 0));
            } else if (i == 1) {
                this.arrays.position.push(vec3(0, 1, 1));
            } else {
                this.arrays.position.push(vec3(1, 1, 1));
            }
        }

         */

        //this.arrays.color = [color(1, 0, 0, 1), color(0, 1, 0, 1), color(0, 0, 1, 1)];
    }
}

export class Tunnel extends Scene {
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
        //console.log(this.bufferLength);
        this.dataArray = new Uint8Array(this.bufferLength);
        this.dataArray.fill(0);

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            t3: new defs.Torus(30, 30),
            donut2: new (defs.Torus.prototype.make_flat_shaded_version())(50, 50, [[0, 2], [0, 1]]),
            outline: new Cylinder_Outline(),
            tube: new defs.Cylindrical_Tube(30,30,[[0, 2], [0, 1]]),
            strip: new Cube_Single_Strip(),
            minimal: new defs.Minimal_Shape(),
            cylinder: new Minimal_Cylinder(),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            t3: new Material(new Ring_Shader(),
                {ambient: 0, diffusivity: 1, specularity: 1, color: color(1, .5, .25, 1)}),
        }

        this.white = new Material(new defs.Basic_Shader());
        this.other = new Material(new defs.Phong_Shader());

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 20), vec3(1, 0, 0), vec3(0, 1, 0));
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
        })
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);


        if (this.attached !== undefined) {
            let desired = this.attached();
            if (desired === "initial") {
                desired = this.initial_camera_location;
            }
            else {
                desired = Mat4.inverse(desired.times(Mat4.translation(0, 0, 5)));
            }
            program_state.set_camera(desired);
        }

        //const light_position = vec4(0, 0, 0, 1);
        //program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10 ** 3)];

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();

        this.analyzer.getByteFrequencyData(this.dataArray);
        //this.dataArray.fill(1.0);
        //console.log(this.dataArray);

        // LIGHTING, for some reason doesnt work when light defined after sun drawn...?
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10000)];

        /*
        let ring3_matrix = Mat4.identity();
        ring3_matrix = ring3_matrix.times(Mat4.scale(30, 30 , 1000));
        const random = (x) => Math.sin(1000 * x + program_state.animation_time / 1000);

        // Update the JavaScript-side shape with new vertices:
        this.shapes.donut2.arrays.position.forEach((p, i, a) =>
            a[i] = vec3(p[0], p[1], p[2]));


        this.shapes.donut2.draw(context, program_state, ring3_matrix, this.materials.test);
        this.shapes.donut2.copy_onto_graphics_card(context.context, ["position"], false);

         */

        //this.white = new Material(new defs.Basic_Shader());
        /*
        const random = (x) => Math.abs(Math.sin(10000*x + this.dataArray[20] / 1000));

        this.shapes.outline.arrays.color.forEach((c, i, a) =>
            a[i] = vec4(random(i), random(i), random(i), c[3])
        )

        //console.log(this.shapes.strip.arrays.color);
        //this.shapes.outline.draw(context, program_state, model_transform, this.white);
        //this.shapes.strip.draw(context, program_state, model_transform, this.materials.test.override({color: color(1,1,1,1)}), "TRIANGLE_STRIP");
        //this.shapes.outline.copy_onto_graphics_card(context.context, ["color"], false);


        //program_state.temp = [3.0, 1.0, 4.0, 2.0, 1.0];
        program_state.temp = this.dataArray;
        console.log(this.dataArray);
        */

        const random = (x) => Math.abs(Math.sin(1000*x + program_state.animation_time/1000));

        const freq_scale = (x) => this.dataArray[x]/255;

        this.shapes.cylinder.arrays.color.forEach((c, i, a) =>
            a[i] = vec4(freq_scale(i%512), random(i), c[2], c[3])
        )

        this.shapes.cylinder.draw(context, program_state, model_transform, this.white);
        this.shapes.cylinder.copy_onto_graphics_card(context.context, ["color"], false);
        //this.shapes.tube.draw(context, program_state, model_transform, this.materials.t3);

    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 vertex_color;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vertex_color = vec4( shape_color.xyz * ambient, shape_color.w );
                vertex_color.xyz = phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                //gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                gl_FragColor = vertex_color;
                // Compute the final color with contributions from lights:
                //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                gl_FragColor.xyz = vertex_color.xyz;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material, dataArray) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
        context.uniform1fv(gpu_addresses.freq_array, graphics_state.temp);
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        varying vec4 bottom;
        varying float test0;
        varying float test1;
        varying float test2;
        varying float test3;
        varying float test4;
        varying float test5;
        varying float test6;
        varying float test7;
        varying float test8;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        uniform float freq_array[512];
        
        void main(){
          gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
          point_position = model_transform * vec4( position, 1.0 );
          //center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
          center = vec4(0.0, 0.0, 0.0, 1.0);
          bottom = model_transform * vec4(0.0, -1.0, 0.0, 1.0);
          test0 = freq_array[0]/255.0;
          test1 = freq_array[2]/255.0;
          test2 = freq_array[4]/255.0;
          test3 = freq_array[6]/255.0;
          test4 = freq_array[8]/255.0;
          test5 = freq_array[10]/255.0;
          test6 = freq_array[12]/255.0;
          test7 = freq_array[14]/255.0;
          test8 = freq_array[16]/255.0;
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          //vec4 local_position = point_position - center;
          
          float dist_to_bottom = point_position.y - bottom.y;
          
          /*
          float dist_to_bottom_100 = dist_to_bottom * 100.0;
          float dist_to_bottom_100_ceil = ceil(dist_to_bottom_100);
          
          float test = 0.0;
          for (int k = 0; k < 100; k++) {
             if (dist_to_bottom_100_ceil == 1) {
                test = freq_array[k];
             }
          }
          */
          
                
          if (dist_to_bottom < 0.01) {
            gl_FragColor = vec4(1.0-0.5*test0, 1.0-0.5*test0, 1, .5);
          } else {
            if (dist_to_bottom < 0.03) {
                gl_FragColor = vec4(1.0-0.5*test1, 1.0-0.5*test1, 1, .5);
            } else {
                if (dist_to_bottom < 0.05) {
                    gl_FragColor = vec4(1.0-0.5*test2, 1.0-0.5*test2, 1, .5);
                } else {
                    if (dist_to_bottom < 0.07) {
                        gl_FragColor = vec4(1.0-0.5*test3, 1.0-0.5*test3, 1, .5);
                    } else {
                        if (dist_to_bottom < 0.09) {
                            gl_FragColor = vec4(1.0-0.5*test4, 1.0-0.5*test4, 1, .5);
                        } else {
                            if (dist_to_bottom < 0.11) {
                                gl_FragColor = vec4(1.0-0.5*test5, 1.0-0.5*test5, 1, .5);
                            } else {
                                if (dist_to_bottom < 0.13) {
                                    gl_FragColor = vec4(1.0-0.5*test6, 1.0-0.5*test6, 1, .5);
                                } else {
                                    if (dist_to_bottom < 0.13) {
                                        gl_FragColor = vec4(1.0-0.5*test7, 1.0-0.5*test7, 1, .5);
                                    } else {
                                        gl_FragColor = vec4(1.0, 1.0, 1.0, .5);
                                    }
                                }
                            }
                        }
                    }
                }
            }
          }

          
          //gl_FragColor = sin(point_position.y*test)*vec4(1, 1, 1, .5);
          //gl_FragColor = vec4(0.5 + 0.5 * sin(local_position.x), 0.5 + 0.5 * sin(local_position.y), 0.5 + 0.5 * sin(local_position.z), 1.0);
        }`;
    }
}

