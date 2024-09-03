
parameter_sets = [
    [76.23, 13.03, 23.05, -0.08, -3.87, 13.26],
    [70.76, 36.66, -15.06, 29.02, 24.29, -4.90],
    [49.59, 5.29, 32.34, -10.01, 30.06, 13.01],
    [117.07, -21.58, 10.19, -0.28, 0.34, 21.21],
    [94.72, 9.19, 1.70, -7.75, -2.97, -5.13]
]

def calculate_average_params(parameter_sets):
    number_of_sets = len(parameter_sets)
    sum_params = [0] * len(parameter_sets[0])

    for params in parameter_sets:
        for index, value in enumerate(params):
            sum_params[index] += value

    average_params = [sum_value / number_of_sets for sum_value in sum_params]
    return average_params

new_params = calculate_average_params(parameter_sets)

print(new_params)
