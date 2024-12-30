def bubble_sort(array):
    array_length = len(array)
    
    # Iterate through the array
    for i in range(array_length):
        # Flag to optimize for already sorted arrays
        swapped = False
        
        # Compare adjacent elements
        for j in range(array_length - 1 - i):  # -i because last i elements are already sorted
            # If current element is greater than next element, swap them
            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                swapped = True
        
        # If no swapping occurred, array is already sorted
        if not swapped:
            break
    
    return array
