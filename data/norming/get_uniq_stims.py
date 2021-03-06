import pandas as pd
from collections import defaultdict 

desired_stims = 10
d = pd.read_csv('overall_comparisons.csv')
targets = pd.unique(d['target_id'])

duplicates = defaultdict(list)
duplicates.update({
    'A2.jpg': 'tangram-150.jpg',
    'tangram-150.jpg' : 'A2.jpg',
    'V1.jpg': 'tangram-90.jpg',
    'tangram-90.jpg' : 'V1.jpg',
    'Y1.jpg': 'tangram-142.jpg',
    'tangram-142.jpg' : 'Y1.jpg',
    'O1.jpg' : 'tangram-32.jpg',
    'tangram-32.jpg' : 'O1.jpg',
    'R1.jpg' : 'tangram-55.jpg',
    'tangram-55.jpg' : 'R1.jpg'
})

def get_distractor_lists (d, previously_used) :
    matches = pd.DataFrame(columns = ['target', 'close_distractor', 'far_distractor', 'overlap_diff'])
    # only consider targets that haven't previously appeared as targets
    for target in [t for t in targets if t not in previously_used] :

        # we want to make sure duplicates don't appear in the same context (e.g. if O1 is context, tangram-32 will be
        # most similar distractor simply because it's the exact same image)
        excluded = previously_used.copy()
        excluded.extend([duplicates[target]])
        print(excluded)
        relevant_rows = (d
                         .query('target_id == "{}" or comparison_id == "{}"'.format(target, target))
                         .query('target_id not in {}'.format(excluded))
                         .query('comparison_id not in {}'.format(excluded))
                         .sort_values('overlap'))

        # identify the most and least similar tangrams to the target
        highest_row = relevant_rows.iloc[-1]
        lowest_row = relevant_rows.iloc[0]
        highest_distractor = [a for a in [highest_row['target_id'], highest_row['comparison_id']] if a != target]
        lowest_distractor = [a for a in [lowest_row['target_id'], lowest_row['comparison_id']] if a != target]
        matches = matches.append(pd.DataFrame({
            'target' : [target],
            'close_distractor' : highest_distractor,
            'far_distractor': lowest_distractor,
            'close_overlap': highest_row['overlap'],
            'far_overlap' : lowest_row['overlap'],
            'overlap_diff' : highest_row['overlap'] - lowest_row['overlap']
        }))

    # pull out the target with the biggest difference b/w close and far 
    return matches.sort_values('overlap_diff').iloc[-1]

# we iteratively find the next stimulus pair that is maximally distinct,
# excluding all tangrams that have previously been identified
# so we end up with the optimal 'greedy' sequence of stims
stims = pd.DataFrame(columns = ['target', 'close_distractor', 'far_distractor', 'overlap_diff', 'close_overlap','far_overlap'])
previously_used = []
for i in range(desired_stims) :
    next_stim = get_distractor_lists(d, previously_used)
    stims = stims.append(next_stim)
    previously_used.extend([
        next_stim['close_distractor'], next_stim['far_distractor'], next_stim['target'],
        duplicates[next_stim['close_distractor']], duplicates[next_stim['far_distractor']], duplicates[next_stim['target']]
    ])
    print(previously_used)
stims.to_csv('jsPsychStims.csv', index=False)
