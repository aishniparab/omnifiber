# omnifiber
Live here: https://turingtestaishni.github.io/omnifiber/

To run locally via:
> go to project directory
> run 'php -S localhost:8000' 
> go to http://localhost:3000/ in your browser

Current bugs:
* no reset option, need to refresh page
* cannot interchange between primitive types
* actuation is not smooth, sometimes disappears if value is too small or too late
* actuation is hard coded with one segment, currently does not work with multiple segments
* simulation mode bending are hard coded for max pressure (does not change dynamically with actuation)
* does not support out-of-plane bending in z-axis
* does not support multi-fiber
